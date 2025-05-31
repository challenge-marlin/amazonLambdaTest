const MatchModel = require('../models/MatchModel');
const ResponseService = require('../services/ResponseService');
const ValidationService = require('../services/ValidationService');

class MatchController {
    constructor() {
        this.matchModel = new MatchModel();
    }

    /**
     * じゃんけんの手を送信
     */
    async submitHand(requestData) {
        try {
            console.log("手の送信処理開始:", requestData);

            // バリデーション
            const validation = ValidationService.validateHandSubmission(requestData);
            if (!validation.isValid) {
                return ResponseService.validationError(
                    validation.errors.join(', '),
                    validation.errors
                );
            }

            const { userId, matchingId, hand, matchType } = requestData;

            // マッチデータを取得または初期化
            let matchData = await this.matchModel.getMatchData(matchingId);
            
            if (!matchData || Object.keys(matchData).length === 0) {
                // 新規マッチを初期化
                matchData = await this.matchModel.initializeMatch(matchingId, userId, matchType);
                console.log("新規マッチ作成:", matchData);
            } else {
                // 既存マッチにプレイヤーを参加させる
                matchData = await this.matchModel.joinMatch(matchingId, userId);
            }

            // 手を送信
            const result = await this.matchModel.submitHand(matchingId, userId, hand);

            const statusMessage = result.canJudge 
                ? "両プレイヤーの手が揃いました。判定可能です。"
                : "相手の手を待っています";

            return ResponseService.gameSuccess("手を送信しました", {
                status: result.gameStatus,
                statusMessage: statusMessage,
                canJudge: result.canJudge,
                matchData: {
                    matchingId,
                    player1_id: result.matchData.player1_id,
                    player2_id: result.matchData.player2_id,
                    yourHand: hand,
                    roundNumber: result.roundNumber,
                }
            });

        } catch (error) {
            console.error("手の送信エラー:", error);
            
            // ビジネスロジックエラーの場合
            if (error.message.includes('既に終了しています') || 
                error.message.includes('参加できません') ||
                error.message.includes('送信済みです')) {
                return ResponseService.businessError(error.message);
            }

            return ResponseService.error("手の送信中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * じゃんけんマッチの判定
     */
    async judgeMatch(requestData) {
        try {
            console.log("判定処理開始:", requestData);

            // バリデーション
            const validation = ValidationService.validateJudgeRequest(requestData);
            if (!validation.isValid) {
                return ResponseService.validationError(
                    validation.errors.join(', '),
                    validation.errors
                );
            }

            const { matchingId } = requestData;

            // マッチ判定を実行
            const result = await this.matchModel.judgeMatch(matchingId);

            let message;
            if (result.isDraw) {
                message = `あいこです！${result.drawCount + 1}回目のじゃんけんを行ってください。`;
            } else {
                const winnerText = result.winner === "1" ? "プレイヤー1" : "プレイヤー2";
                message = `${winnerText}（${result.winner === "1" ? result.player1.id : result.player2.id}）の勝利です！`;
            }

            // マッチ履歴をデータベースに保存（ゲーム終了時のみ）
            if (!result.isDraw) {
                await this.matchModel.saveMatchHistory(
                    matchingId,
                    result.player1.id,
                    result.player2.id,
                    result.player1.hand,
                    result.player2.hand,
                    result.result,
                    result.winner
                );
            }

            return ResponseService.gameSuccess(message, {
                result: result.result,
                winner: result.winner,
                isDraw: result.isDraw,
                drawCount: result.drawCount,
                player1: result.player1,
                player2: result.player2,
                gameStatus: result.gameStatus
            });

        } catch (error) {
            console.error("判定処理エラー:", error);
            
            // ビジネスロジックエラーの場合
            if (error.message.includes('見つかりません') || 
                error.message.includes('揃っていません') ||
                error.message.includes('提出されていません')) {
                return ResponseService.businessError(error.message);
            }

            return ResponseService.error("判定処理中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * マッチ状態の取得
     */
    async getMatchStatus(matchingId) {
        try {
            if (!matchingId) {
                return ResponseService.validationError("マッチングIDは必須です");
            }

            const matchData = await this.matchModel.getMatchData(matchingId);

            if (!matchData) {
                return ResponseService.notFound("指定されたマッチが見つかりません");
            }

            // プレイヤーの手履歴を取得
            const player1HandHistory = matchData[`${matchData.player1_id}_hand_history`] 
                ? JSON.parse(matchData[`${matchData.player1_id}_hand_history`]) : [];
            const player2HandHistory = matchData.player2_id && matchData[`${matchData.player2_id}_hand_history`] 
                ? JSON.parse(matchData[`${matchData.player2_id}_hand_history`]) : [];

            const responseData = {
                matchingId,
                player1_id: matchData.player1_id,
                player2_id: matchData.player2_id,
                game_status: matchData.game_status,
                drawCount: parseInt(matchData.drawCount || '0'),
                winner: matchData.winner,
                matchType: matchData.matchType,
                player1Rounds: player1HandHistory.length,
                player2Rounds: player2HandHistory.length,
                canJudge: player1HandHistory.length > 0 && 
                         player2HandHistory.length > 0 && 
                         player1HandHistory.length === player2HandHistory.length &&
                         matchData.game_status !== "finished"
            };

            return ResponseService.success({ match: responseData });

        } catch (error) {
            console.error("マッチ状態取得エラー:", error);
            return ResponseService.error("マッチ状態取得中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }
}

module.exports = MatchController; 