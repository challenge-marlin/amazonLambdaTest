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

            const { userId, matchingId, hand } = requestData;

            // マッチデータを取得
            let matchData = await this.matchModel.getMatchData(matchingId);
            
            if (!matchData || Object.keys(matchData).length === 0) {
                return ResponseService.notFound("指定されたマッチングが見つかりません。先にマッチングを開始してください。");
            }

            // 既存マッチにプレイヤーが参加していない場合は参加させる
            if (matchData.player1_id !== userId && matchData.player2_id !== userId) {
                if (!matchData.player2_id) {
                    // プレイヤー2として参加
                    matchData = await this.matchModel.joinMatch(matchingId, userId);
                } else {
                    return ResponseService.businessError("このマッチは既に満員です");
                }
            }

            // 手を送信
            const result = await this.matchModel.submitHand(matchingId, userId, hand);
            
            console.log(`✅ 手の送信成功: userId=${userId}, hand=${hand}, canJudge=${result.canJudge}, status=${result.gameStatus}`);
            console.log(`🎯 送信後のマッチデータ:`, JSON.stringify(result.matchData, null, 2));

            const statusMessage = result.canJudge 
                ? "両プレイヤーの手が揃いました。判定可能です。"
                : "相手の手を待っています";

            // 仕様書通りの形式で返す
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    message: "手を送信しました",
                    status: result.gameStatus
                }, null, 0, 'utf8')
            };

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

            // 仕様書通りの形式で返す
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    result: {
                        player1_hand: result.player1.hand,
                        player2_hand: result.player2.hand,
                        player1_result: result.player1.result,
                        player2_result: result.player2.result,
                        winner: result.winner,
                        is_draw: result.isDraw,
                        draw_count: result.drawCount,
                        judged: true,
                        judged_at: new Date().toISOString(),
                        is_finished: !result.isDraw
                    }
                }, null, 0, 'utf8')
            };

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

            // 最新の手を取得
            const player1_latest_hand = player1HandHistory.length > 0 ? player1HandHistory[player1HandHistory.length - 1] : null;
            const player2_latest_hand = player2HandHistory.length > 0 ? player2HandHistory[player2HandHistory.length - 1] : null;

            console.log(`🎮 手の履歴確認: player1=${player1HandHistory.length}件, player2=${player2HandHistory.length}件`);
            console.log(`🖐️ 最新の手: player1=${player1_latest_hand}, player2=${player2_latest_hand}`);

            // ステータス判定ロジックを仕様書通りに修正
            let status = "waiting";
            let player1_ready = false;
            let player2_ready = false;

            // ゲームが終了している場合は最優先
            if (matchData.game_status === 'finished') {
                status = "finished";
                player1_ready = !!matchData.player1_ready;
                player2_ready = !!matchData.player2_ready;
            } else if (matchData.player1_id && matchData.player2_id) {
                // 両プレイヤーが揃った場合
                player1_ready = !!matchData.player1_ready;
                player2_ready = !!matchData.player2_ready;

                if (player1_ready && player2_ready) {
                    // 両者準備完了の場合
                    status = "ready";
                } else {
                    // マッチング成立、準備待ち
                    status = "matched";
                }
            } else {
                // プレイヤー2が未参加
                status = "waiting";
                player1_ready = false;
                player2_ready = false;
            }

            // 結果判定済みの場合は結果に応じてステータスを設定
            if (matchData.result && matchData.result !== 'null') {
                try {
                    const result = JSON.parse(matchData.result);
                    if (result.is_draw) {
                        status = "draw";
                    } else if (result.is_finished) {
                        status = "finished";
                    }
                } catch (e) {
                    console.error("結果データのパースエラー:", e);
                }
            }

            console.log(`📊 マッチ状態判定: status=${status}, p1_ready=${player1_ready}, p2_ready=${player2_ready}`);

            // マッチングIDを確実に取得（複数のフィールド名を試す）
            const resolvedMatchingId = matchData.matching_id || 
                                     matchData.matchingId || 
                                     matchData.id || 
                                     matchingId; // 最後の手段としてパラメータの値を使用

            console.log(`🆔 マッチングID解決: データ内ID=${matchData.matching_id || matchData.matchingId || matchData.id}, パラメータID=${matchingId}, 解決済みID=${resolvedMatchingId}`);

            // 仕様書通りのレスポンス形式で返す
            const responseData = {
                success: true,
                id: resolvedMatchingId,
                player1_id: matchData.player1_id,
                player2_id: matchData.player2_id || null,
                status: status,
                player1_ready: player1_ready,
                player2_ready: player2_ready,
                player1_hand: player1_latest_hand,
                player2_hand: player2_latest_hand,
                draw_count: parseInt(matchData.draw_count) || 0
            };

            // 結果判定済みの場合のみresultを追加
            if (matchData.result && matchData.result !== 'null') {
                try {
                    responseData.result = JSON.parse(matchData.result);
                } catch (e) {
                    console.error("結果データのパースエラー:", e);
                }
            }

            // 直接レスポンスを返す（ResponseService.successで包まない）
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify(responseData, null, 0, 'utf8')
            };

        } catch (error) {
            console.error("マッチ状態取得エラー:", error);
            return ResponseService.serverError("マッチ状態の取得中にエラーが発生しました");
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
            
            // レスポンス形式を仕様書通りに統一（二重ネストを解消）
            if (matchStatusResult.statusCode === 200) {
                let matchData;
                try {
                    const responseBody = typeof matchStatusResult.body === 'string' 
                        ? JSON.parse(matchStatusResult.body) 
                        : matchStatusResult.body;
                    
                    // getMatchStatusの戻り値はResponseService.success()で包まれているので、dataを取得
                    matchData = responseBody.data || responseBody;
                    
                    console.log(`🔍 取得したマッチデータ:`, JSON.stringify(matchData, null, 2));
                    
                } catch (e) {
                    console.error("マッチデータのパースエラー:", e);
                    // より詳細なエラー情報をログ出力
                    console.error("エラー詳細:", {
                        body: matchStatusResult.body,
                        bodyType: typeof matchStatusResult.body,
                        bodyLength: matchStatusResult.body?.length
                    });
                    return ResponseService.serverError("マッチデータの解析に失敗しました");
                }
                
                // 仕様書通りの形式で返す（dataネストを削除）
                const response = {
                    success: true,
                    id: matchData.id || matchId,
                    player1_id: matchData.player1_id,
                    player2_id: matchData.player2_id,
                    status: matchData.status,
                    player1_ready: matchData.player1_ready,
                    player2_ready: matchData.player2_ready,
                    player1_hand: matchData.player1_hand,
                    player2_hand: matchData.player2_hand,
                    draw_count: matchData.draw_count
                };

                // 結果がある場合は追加
                if (matchData.result) {
                    response.result = matchData.result;
                }

                console.log(`📊 ユーザー ${userId} のマッチ状態: ${response.status} (マッチID: ${response.id})`);
                
                // 直接レスポンスを返す（ResponseService.successで包まない）
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                    },
                    body: JSON.stringify(response, null, 0, 'utf8')
                };
            } else {
                return matchStatusResult;
            }

        } catch (error) {
            console.error("ユーザーマッチ状態取得エラー:", error);
            return ResponseService.serverError("ユーザーマッチ状態取得中にエラーが発生しました");
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

            console.log(`🎯 マッチング開始処理: ユーザー ${userId} (タイプ: ${matchType})`);

            // 既存のアクティブなマッチをチェック
            const existingMatch = await this.matchModel.findActiveMatchByUserId(userId);
            if (existingMatch) {
                console.log(`⚠️  既存アクティブマッチ発見: ${existingMatch}`);
                return ResponseService.businessError("既にアクティブなマッチに参加しています");
            }

            // 新しいマッチングIDを生成
            const matchingId = `match_${userId}_${Date.now()}`;
            console.log(`🆔 新規マッチングID生成: ${matchingId}`);

            // 待機中のマッチを検索（ランダムマッチの場合）
            if (matchType === "random") {
                console.log(`🔍 待機中マッチを検索中...`);
                const waitingMatch = await this.matchModel.findWaitingMatch(userId);
                if (waitingMatch) {
                    // 待機中のマッチに参加
                    console.log(`✅ 待機中マッチに参加: ${waitingMatch} (プレイヤー2として参加)`);
                    const matchData = await this.matchModel.joinMatch(waitingMatch, userId);
                    
                    // 仕様書通りの形式で返す
                    return {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                        },
                        body: JSON.stringify({
                            success: true,
                            message: "マッチングが成立しました",
                            matchingId: waitingMatch,
                            status: "matched"
                        }, null, 0, 'utf8')
                    };
                } else {
                    console.log(`❌ 待機中マッチなし。新規マッチを作成します`);
                }
            }

            // 新しいマッチを作成
            console.log(`🆕 新しいマッチを作成: ${matchingId} (プレイヤー1として)`);
            const matchData = await this.matchModel.initializeMatch(matchingId, userId, matchType);

            // 仕様書通りの形式で返す
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    message: "マッチングを開始しました。相手を待っています。",
                    matchingId: matchingId,
                    status: "waiting"
                }, null, 0, 'utf8')
            };

        } catch (error) {
            console.error("❌ マッチング開始エラー:", error);
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

            console.log(`🔄 手のリセット処理: ${matchingId}`);

            const matchData = await this.matchModel.getMatchData(matchingId);

            if (!matchData) {
                return ResponseService.notFound("指定されたマッチが見つかりません");
            }

            // 手と結果をリセット（準備状態と引き分け回数は保持）
            const updateData = {
                player1_hand: null,
                player2_hand: null,
                result: null,
            };

            // 手履歴もクリア（新しいラウンド開始）
            if (matchData.player1_id) {
                updateData[`${matchData.player1_id}_hand_history`] = JSON.stringify([]);
            }
            if (matchData.player2_id) {
                updateData[`${matchData.player2_id}_hand_history`] = JSON.stringify([]);
            }

            await this.matchModel.saveMatchData(matchingId, updateData);

            console.log(`✅ 手のリセット完了: ${matchingId}`);

            // 仕様書通りの形式で返す
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    message: "手をリセットしました。次のラウンドを開始してください。",
                    status: "ready",  // 引き分け後は再びready状態に戻る
                    matchingId: matchingId
                }, null, 0, 'utf8')
            };

        } catch (error) {
            console.error("手のリセットエラー:", error);
            return ResponseService.serverError("手のリセット中にエラーが発生しました");
        } finally {
            // Redis接続をクリーンアップ
            await this.matchModel.closeRedis();
        }
    }

    /**
     * プレイヤーの準備完了
     */
    async setPlayerReady(requestData) {
        try {
            const { userId, matchingId } = requestData;

            if (!userId || !matchingId) {
                return ResponseService.validationError("ユーザーIDとマッチングIDは必須です");
            }

            console.log(`🎯 準備完了処理: userId=${userId}, matchingId=${matchingId}`);

            // マッチデータを取得
            const matchData = await this.matchModel.getMatchData(matchingId);
            
            if (!matchData || Object.keys(matchData).length === 0) {
                return ResponseService.notFound("指定されたマッチングが見つかりません");
            }

            // プレイヤーが参加しているかチェック
            if (matchData.player1_id !== userId && matchData.player2_id !== userId) {
                return ResponseService.businessError("このマッチに参加していません");
            }

            console.log(`🔍 現在のマッチデータ:`, {
                player1_id: matchData.player1_id,
                player2_id: matchData.player2_id,
                player1_ready: matchData.player1_ready,
                player2_ready: matchData.player2_ready,
                stored_status: matchData.status
            });

            // ステータス判定ロジック（getMatchStatusと同じ）
            let currentStatus = "waiting";
            if (matchData.player1_id && matchData.player2_id) {
                // 両プレイヤーが揃った場合
                const player1_ready = !!matchData.player1_ready;
                const player2_ready = !!matchData.player2_ready;

                if (player1_ready && player2_ready) {
                    // 両者準備完了の場合
                    currentStatus = "ready";
                } else {
                    // マッチング成立、準備待ち
                    currentStatus = "matched";
                }
            } else {
                // プレイヤー2が未参加
                currentStatus = "waiting";
            }

            console.log(`📊 計算されたステータス: ${currentStatus}`);

            // マッチングが正しい状態かチェック（動的計算されたステータスを使用）
            if (currentStatus !== 'matched' && currentStatus !== 'ready') {
                return ResponseService.businessError(`現在の状態では準備完了できません (状態: ${currentStatus})`);
            }

            // プレイヤーの準備状態を更新
            const updateData = {};
            if (matchData.player1_id === userId) {
                updateData.player1_ready = true;
                console.log(`✅ プレイヤー1 (${userId}) の準備完了`);
            } else {
                updateData.player2_ready = true;
                console.log(`✅ プレイヤー2 (${userId}) の準備完了`);
            }

            // 更新を実行
            await this.matchModel.saveMatchData(matchingId, updateData);

            // 更新後のデータを取得
            const updatedMatchData = await this.matchModel.getMatchData(matchingId);

            // 両プレイヤーが準備完了の場合、ステータスを'ready'に更新
            if (updatedMatchData.player1_ready && updatedMatchData.player2_ready) {
                await this.matchModel.saveMatchData(matchingId, { status: 'ready' });
                currentStatus = 'ready';
                console.log(`🚀 両プレイヤー準備完了！ステータスを ready に更新`);
            } else {
                currentStatus = 'matched';  // まだ片方のみ準備完了
            }

            // プレイヤーの手履歴を取得
            const player1HandHistory = updatedMatchData[`${updatedMatchData.player1_id}_hand_history`] 
                ? JSON.parse(updatedMatchData[`${updatedMatchData.player1_id}_hand_history`]) : [];
            const player2HandHistory = updatedMatchData.player2_id && updatedMatchData[`${updatedMatchData.player2_id}_hand_history`] 
                ? JSON.parse(updatedMatchData[`${updatedMatchData.player2_id}_hand_history`]) : [];

            // 仕様書通りの形式で返す（GET /matchと同じ形式）
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
                },
                body: JSON.stringify({
                    success: true,
                    id: matchingId,
                    player1_id: updatedMatchData.player1_id,
                    player2_id: updatedMatchData.player2_id,
                    status: currentStatus,  // 動的に計算したステータスを使用
                    player1_ready: Boolean(updatedMatchData.player1_ready),
                    player2_ready: Boolean(updatedMatchData.player2_ready),
                    player1_hand: updatedMatchData.player1_hand,
                    player2_hand: updatedMatchData.player2_hand,
                    draw_count: parseInt(updatedMatchData.draw_count) || 0,
                    player1_hand_history: player1HandHistory,
                    player2_hand_history: player2HandHistory,
                    message: updatedMatchData.player1_ready && updatedMatchData.player2_ready 
                        ? "両プレイヤーが準備完了しました" 
                        : "準備完了しました"
                }, null, 0, 'utf8')
            };

        } catch (error) {
            console.error("準備完了処理エラー:", error);
            return ResponseService.error("準備完了処理中にエラーが発生しました");
        }
    }
}

module.exports = MatchController; 