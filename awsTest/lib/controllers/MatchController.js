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

            // 現在のラウンドの手を取得
            const currentRound = Math.max(player1HandHistory.length - 1, 0);
            const player1Hand = player1HandHistory[currentRound] || null;
            const player2Hand = player2HandHistory[currentRound] || null;

            // マッチングステータスを決定
            let status = "waiting";
            let player1Ready = player1HandHistory.length > 0;
            let player2Ready = player2HandHistory.length > 0 && matchData.player2_id;
            
            if (matchData.game_status === "finished") {
                status = "finished";
            } else if (player1Ready && player2Ready && player1HandHistory.length === player2HandHistory.length) {
                status = "ready";
            } else if (matchData.game_status === "draw") {
                status = "draw";
            }

            // API仕様書に合わせたレスポンス形式
            const responseData = {
                success: true,
                id: matchingId,
                player1_id: matchData.player1_id,
                player2_id: matchData.player2_id || null,
                status: status,
                player1_ready: player1Ready,
                player2_ready: player2Ready,
                player1_hand: player1Hand,
                player2_hand: player2Hand,
                draw_count: parseInt(matchData.drawCount || '0')
            };

            // 結果判定済みの場合の結果情報を追加
            if (status === "finished" || status === "draw") {
                responseData.result = {
                    player1_result: matchData.winner === "1" ? "win" : matchData.winner === "2" ? "lose" : "draw",
                    player2_result: matchData.winner === "2" ? "win" : matchData.winner === "1" ? "lose" : "draw",
                    winner: parseInt(matchData.winner || '3'), // 1=プレイヤー1, 2=プレイヤー2, 3=引き分け
                    is_draw: matchData.winner === "3" || status === "draw",
                    is_finished: status === "finished"
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(responseData)
            };

        } catch (error) {
            console.error("マッチ状態取得エラー:", error);
            return ResponseService.error("マッチ状態取得中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * ユーザーの現在のマッチング状態を取得
     */
    async getUserMatchStatus(userId) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            console.log(`ユーザー ${userId} のマッチング状態を取得中...`);

            // ユーザーが参加している進行中のマッチを検索
            const matchId = await this.matchModel.findActiveMatchByUserId(userId);

            if (!matchId) {
                // アクティブなマッチが見つからない場合は、マッチング待ち状態を返す
                return ResponseService.success({
                    success: true,
                    status: "no_match",
                    message: "アクティブなマッチが見つかりません",
                    userId: userId,
                    matchingId: null
                });
            }

            // 見つかったマッチの詳細状態を取得
            const matchStatusResult = await this.getMatchStatus(matchId);
            
            // レスポンス形式を統一
            if (matchStatusResult.statusCode === 200) {
                const matchData = JSON.parse(matchStatusResult.body);
                matchData.userId = userId;
                matchData.status = matchData.status || "waiting";
                
                return ResponseService.success(matchData);
            } else {
                return matchStatusResult;
            }

        } catch (error) {
            console.error("ユーザーマッチ状態取得エラー:", error);
            return ResponseService.error("ユーザーマッチ状態取得中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * マッチングを開始
     */
    async startMatch(userId, matchType = "random") {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            console.log(`ユーザー ${userId} のマッチングを開始中... (タイプ: ${matchType})`);

            // 既存のアクティブなマッチをチェック
            const existingMatch = await this.matchModel.findActiveMatchByUserId(userId);
            if (existingMatch) {
                console.log(`既存のアクティブなマッチが見つかりました: ${existingMatch}`);
                return ResponseService.businessError("既にアクティブなマッチに参加しています");
            }

            // 新しいマッチングIDを生成
            const matchingId = `match_${userId}_${Date.now()}`;

            // 待機中のマッチを検索（ランダムマッチの場合）
            if (matchType === "random") {
                const waitingMatch = await this.matchModel.findWaitingMatch(userId);
                if (waitingMatch) {
                    // 待機中のマッチに参加
                    console.log(`待機中のマッチに参加: ${waitingMatch}`);
                    const matchData = await this.matchModel.joinMatch(waitingMatch, userId);
                    
                    return ResponseService.success({
                        success: true,
                        message: "マッチングが成立しました",
                        matchingId: waitingMatch,
                        status: "matched",
                        player1_id: matchData.player1_id,
                        player2_id: matchData.player2_id,
                        matchType: matchType
                    });
                }
            }

            // 新しいマッチを作成
            console.log(`新しいマッチを作成: ${matchingId}`);
            const matchData = await this.matchModel.initializeMatch(matchingId, userId, matchType);

            return ResponseService.success({
                success: true,
                message: "マッチングを開始しました。相手を待っています。",
                matchingId: matchingId,
                status: "waiting",
                player1_id: userId,
                player2_id: null,
                matchType: matchType
            });

        } catch (error) {
            console.error("マッチング開始エラー:", error);
            return ResponseService.error("マッチング開始中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * 手のリセット
     */
    async resetHands(matchingId) {
        try {
            if (!matchingId) {
                return ResponseService.validationError("マッチングIDは必須です");
            }

            const matchData = await this.matchModel.getMatchData(matchingId);

            if (!matchData) {
                return ResponseService.notFound("指定されたマッチが見つかりません");
            }

            // 両プレイヤーの手履歴をリセット
            const updateData = {
                game_status: "waiting",
                [`${matchData.player1_id}_hand_history`]: JSON.stringify([]),
            };

            if (matchData.player2_id) {
                updateData[`${matchData.player2_id}_hand_history`] = JSON.stringify([]);
            }

            await this.matchModel.saveMatchData(matchingId, updateData);

            return ResponseService.success({
                message: "手をリセットしました",
                status: "waiting"
            });

        } catch (error) {
            console.error("手のリセットエラー:", error);
            return ResponseService.error("手のリセット中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }
}

module.exports = MatchController; 