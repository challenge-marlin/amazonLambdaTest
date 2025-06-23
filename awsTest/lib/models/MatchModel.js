const BaseModel = require('./BaseModel');
const Redis = require("ioredis");

class MatchModel extends BaseModel {
    constructor() {
        super();
        this.redis = null;
    }

    /**
     * Redis接続を取得
     */
    async getRedisConnection() {
        if (!this.redis || this.redis.status === 'close' || this.redis.status === 'end') {
            console.log("🔄 Redis接続を再作成中...");
            this.redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || '',
                db: 0,
                connectTimeout: 10000,
                lazyConnect: true,
                retryDelayOnFailover: 100,
                enableReadyCheck: false,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    console.log(`🔄 Redis再接続試行 ${times}: ${delay}ms後にリトライ`);
                    return delay;
                },
                reconnectOnError: (err) => {
                    console.log('🔄 Redis再接続判定:', err.message);
                    return err.message.includes('READONLY') || err.message.includes('Connection is closed');
                }
            });

            this.redis.on('connect', () => {
                console.log('✅ Redis接続成功');
            });

            this.redis.on('error', (err) => {
                console.error('❌ Redis接続エラー:', err.message);
            });

            this.redis.on('close', () => {
                console.log('🔌 Redis接続が閉じられました');
            });

            // 接続を確立
            try {
                await this.redis.connect();
                console.log('✅ Redis接続確立完了');
            } catch (error) {
                console.error('❌ Redis接続確立失敗:', error.message);
                throw error;
            }
        }
        return this.redis;
    }

    /**
     * Redis接続をクローズ
     */
    async closeRedis() {
        if (this.redis && this.redis.status !== 'close' && this.redis.status !== 'end') {
            try {
                await this.redis.quit();
                console.log('✅ Redis接続を正常にクローズ');
            } catch (error) {
                console.error('⚠️ Redis切断エラー:', error.message);
                try {
                    this.redis.disconnect();
                } catch (disconnectError) {
                    console.error('⚠️ Redis強制切断エラー:', disconnectError.message);
                }
            }
            this.redis = null;
        }
    }

    /**
     * マッチデータ取得
     */
    async getMatchData(matchingId) {
        const redis = await this.getRedisConnection();
        const matchKey = `match:${matchingId}`;
        try {
            const matchData = await redis.hgetall(matchKey);
            return Object.keys(matchData).length > 0 ? matchData : null;
        } catch (error) {
            console.error("マッチデータ取得エラー:", error);
            throw error;
        }
    }

    /**
     * ユーザーが参加している進行中のマッチを検索
     */
    async findActiveMatchByUserId(userId) {
        const redis = await this.getRedisConnection();
        try {
            // match:* パターンのすべてのキーを取得
            const matchKeys = await redis.keys('match:*');
            
            for (const key of matchKeys) {
                const matchData = await redis.hgetall(key);
                
                // マッチが終了していない場合のみチェック
                if (matchData.game_status !== 'finished' && matchData.game_status !== 'cancelled') {
                    // プレイヤー1またはプレイヤー2として参加している場合
                    if (matchData.player1_id === userId || matchData.player2_id === userId) {
                        // match:プレフィックスを削除してmatchingIdを返す
                        return key.replace('match:', '');
                    }
                }
            }
            
            return null; // アクティブなマッチが見つからない
        } catch (error) {
            console.error("アクティブマッチ検索エラー:", error);
            throw error;
        }
    }

    /**
     * 同日対戦履歴をチェック（将来実装用）
     * @param {string} userId1 プレイヤー1のID
     * @param {string} userId2 プレイヤー2のID
     * @returns {Promise<boolean>} 対戦可能かどうか
     */
    async checkDailyMatchHistory(userId1, userId2) {
        try {
            // 現在はテスト用に常にtrueを返す
            // 将来的にはDATEカラムを使って同日対戦回数をチェック
            const today = new Date().toISOString().split('T')[0];
            
            // TODO: 将来実装時のクエリ例
            // const query = `
            //     SELECT COUNT(*) as match_count 
            //     FROM janken_history 
            //     WHERE ((player1_id = ? AND player2_id = ?) OR (player1_id = ? AND player2_id = ?))
            //     AND DATE(created_at) = ?
            // `;
            // const [rows] = await this.executeQuery(query, [userId1, userId2, userId2, userId1, today]);
            // return rows[0].match_count < 2; // 1日2回まで
            
            console.log(`同日対戦チェック: ${userId1} vs ${userId2} (${today}) - 現在はテスト用に許可`);
            return true; // テスト用に常に許可
        } catch (error) {
            console.error('同日対戦履歴チェックエラー:', error);
            return true; // エラー時は許可
        }
    }

    /**
     * 待機中のマッチを検索（ランダムマッチング用）
     * 将来的には同日対戦制限も考慮
     */
    async findWaitingMatch(excludeUserId) {
        const redis = await this.getRedisConnection();
        try {
            // match:* パターンのすべてのキーを取得
            const matchKeys = await redis.keys('match:*');
            
            for (const key of matchKeys) {
                const matchData = await redis.hgetall(key);
                
                // 待機中で、プレイヤー2がいない、かつ自分以外のマッチを探す
                if (matchData.game_status === 'waiting' && 
                    matchData.player1_id && 
                    !matchData.player2_id && 
                    matchData.player1_id !== excludeUserId &&
                    matchData.matchType === 'random') {
                    
                    // 将来実装: 同日対戦制限チェック
                    const canMatch = await this.checkDailyMatchHistory(excludeUserId, matchData.player1_id);
                    if (!canMatch) {
                        console.log(`同日対戦制限により ${matchData.player1_id} とのマッチングをスキップ`);
                        continue; // このマッチをスキップして次を探す
                    }
                    
                    // match:プレフィックスを削除してmatchingIdを返す
                    return key.replace('match:', '');
                }
            }
            
            return null; // 待機中のマッチが見つからない
        } catch (error) {
            console.error("待機中マッチ検索エラー:", error);
            throw error;
        }
    }

    /**
     * マッチデータ保存
     */
    async saveMatchData(matchingId, matchData) {
        const redis = await this.getRedisConnection();
        const matchKey = `match:${matchingId}`;
        try {
            // 文字エンコーディング問題対策：文字列を安全に処理
            const safeMatchData = {};
            for (const [key, value] of Object.entries(matchData)) {
                if (typeof value === 'string') {
                    // 不正な文字を除去
                    safeMatchData[key] = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '');
                } else {
                    safeMatchData[key] = value;
                }
            }
            
            await redis.hmset(matchKey, safeMatchData);
            // 30分（1800秒）のTTLを設定
            await redis.expire(matchKey, 1800);
            console.log(`⏰ マッチデータにTTL設定: ${matchKey} (30分)`);
            return true;
        } catch (error) {
            console.error("マッチデータ保存エラー:", error);
            throw error;
        }
    }

    /**
     * 新規マッチを初期化
     */
    async initializeMatch(matchingId, userId, matchType = "random") {
        const matchData = {
            player1_id: userId,
            drawCount: "0",
            winner: "0",
            matchType: matchType,
            game_status: "waiting",
            lastUpdateTime: Date.now().toString(),
            [`${userId}_hand_history`]: JSON.stringify([])
        };
        
        await this.saveMatchData(matchingId, matchData);
        return matchData;
    }

    /**
     * プレイヤーをマッチに参加させる
     */
    async joinMatch(matchingId, userId) {
        const matchData = await this.getMatchData(matchingId);
        
        if (!matchData) {
            throw new Error('マッチが見つかりません');
        }

        let updateData = {};
        
        if (!matchData.player1_id) {
            updateData.player1_id = userId;
        } else if (!matchData.player2_id && matchData.player1_id !== userId) {
            updateData.player2_id = userId;
            updateData[`${userId}_hand_history`] = JSON.stringify([]);
        } else if (matchData.player1_id !== userId && matchData.player2_id !== userId) {
            throw new Error('このマッチには参加できません');
        }

        if (Object.keys(updateData).length > 0) {
            const updatedMatchData = { ...matchData, ...updateData };
            await this.saveMatchData(matchingId, updatedMatchData);
            return updatedMatchData;
        }

        return matchData;
    }

    /**
     * プレイヤーの手を記録
     */
    async submitHand(matchingId, userId, hand) {
        console.log(`🎯 submitHand開始: matchingId=${matchingId}, userId=${userId}, hand=${hand}`);
        
        const matchData = await this.getMatchData(matchingId);
        
        if (!matchData) {
            throw new Error('マッチが見つかりません');
        }

        console.log(`📊 現在のマッチデータ:`, JSON.stringify(matchData, null, 2));

        if (matchData.game_status === "finished") {
            throw new Error('このマッチは既に終了しています');
        }

        // 手の履歴を取得・更新
        const handHistoryKey = `${userId}_hand_history`;
        const handHistory = matchData[handHistoryKey] ? JSON.parse(matchData[handHistoryKey]) : [];
        
        console.log(`📝 現在の手履歴 (${handHistoryKey}):`, handHistory);
        
        // 相手プレイヤーの手履歴を取得
        const otherPlayerId = matchData.player1_id === userId ? matchData.player2_id : matchData.player1_id;
        if (otherPlayerId) {
            const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
            const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
            
            console.log(`👥 相手の手履歴 (${otherHandHistoryKey}):`, otherHandHistory);
            
            // 重複送信チェック
            if (handHistory.length > otherHandHistory.length) {
                throw new Error('既にこのラウンドの手を送信済みです。相手の手を待ってください。');
            }
        }

        // 手を履歴に追加
        handHistory.push(hand);
        console.log(`➕ 手を追加後の履歴:`, handHistory);

        // 両プレイヤーの手が揃ったかチェック
        let gameStatus = "waiting";
        let canJudge = false;

        if (matchData.player1_id && matchData.player2_id && otherPlayerId) {
            const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
            const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
            
            if (handHistory.length === otherHandHistory.length && handHistory.length > 0) {
                gameStatus = "ready";
                canJudge = true;
                console.log(`🎊 両プレイヤーの手が揃いました！ラウンド${handHistory.length}`);
            } else {
                console.log(`⏳ 相手の手を待機中... 自分:${handHistory.length}, 相手:${otherHandHistory.length}`);
            }
        }

        // マッチデータを更新
        const updatedMatchData = {
            ...matchData,
            [handHistoryKey]: JSON.stringify(handHistory),
            game_status: gameStatus,
            lastUpdateTime: Date.now().toString()
        };

        console.log(`💾 Redis保存前のデータ:`, JSON.stringify(updatedMatchData, null, 2));
        
        await this.saveMatchData(matchingId, updatedMatchData);
        
        console.log(`✅ Redis保存完了`);

        return {
            success: true,
            gameStatus,
            canJudge,
            roundNumber: handHistory.length,
            matchData: updatedMatchData
        };
    }

    /**
     * マッチ判定処理
     */
    async judgeMatch(matchingId) {
        const matchData = await this.getMatchData(matchingId);
        
        if (!matchData) {
            throw new Error('マッチが見つかりません');
        }

        if (!matchData.player1_id || !matchData.player2_id) {
            throw new Error('マッチにプレイヤーが揃っていません');
        }

        // 最新の手を取得
        const player1HandHistory = JSON.parse(matchData[`${matchData.player1_id}_hand_history`] || '[]');
        const player2HandHistory = JSON.parse(matchData[`${matchData.player2_id}_hand_history`] || '[]');

        if (player1HandHistory.length === 0 || player2HandHistory.length === 0) {
            throw new Error('両プレイヤーの手が提出されていません');
        }

        const player1Hand = player1HandHistory[player1HandHistory.length - 1];
        const player2Hand = player2HandHistory[player2HandHistory.length - 1];

        // じゃんけん判定ロジック
        const result = this.determineWinner(player1Hand, player2Hand);
        
        let updatedMatchData = {
            ...matchData,
            game_status: result.isDraw ? "waiting" : "finished",
            lastUpdateTime: Date.now().toString()
        };

        if (result.isDraw) {
            updatedMatchData.drawCount = (parseInt(matchData.drawCount) + 1).toString();
        } else {
            updatedMatchData.winner = result.winner;
            updatedMatchData.game_status = "finished";
            // 判定結果をRedisに保存
            updatedMatchData.result = JSON.stringify({
                player1_hand: player1Hand,
                player2_hand: player2Hand,
                player1_result: result.isDraw ? 'draw' : (result.winner === '1' ? 'win' : 'lose'),
                player2_result: result.isDraw ? 'draw' : (result.winner === '2' ? 'win' : 'lose'),
                winner: result.winner,
                is_draw: result.isDraw,
                draw_count: parseInt(matchData.drawCount) || 0,
                judged: true,
                judged_at: new Date().toISOString(),
                is_finished: !result.isDraw
            });
        }

        console.log(`🎯 判定結果をRedisに保存: game_status=${updatedMatchData.game_status}`);
        await this.saveMatchData(matchingId, updatedMatchData);

        return {
            player1: {
                id: matchData.player1_id,
                hand: player1Hand,
                result: result.isDraw ? 'draw' : (result.winner === '1' ? 'win' : 'lose')
            },
            player2: {
                id: matchData.player2_id,
                hand: player2Hand,
                result: result.isDraw ? 'draw' : (result.winner === '2' ? 'win' : 'lose')
            },
            result: result.result,
            winner: result.winner,
            isDraw: result.isDraw,
            drawCount: parseInt(updatedMatchData.drawCount),
            gameStatus: updatedMatchData.game_status
        };
    }

    /**
     * じゃんけんの勝敗判定
     */
    determineWinner(hand1, hand2) {
        if (hand1 === hand2) {
            return {
                result: "draw",
                winner: "0",
                isDraw: true
            };
        }

        const winConditions = {
            "グー": "チョキ",
            "チョキ": "パー",
            "パー": "グー"
        };

        if (winConditions[hand1] === hand2) {
            return {
                result: "player1_win",
                winner: "1",
                isDraw: false
            };
        } else {
            return {
                result: "player2_win",
                winner: "2",
                isDraw: false
            };
        }
    }

    /**
     * マッチ履歴をデータベースに保存
     */
    async saveMatchHistory(matchingId, player1Id, player2Id, player1Hand, player2Hand, result, winner) {
        // じゃんけんの手を英語表記に変換
        const handMapping = {
            'グー': 'rock',
            'チョキ': 'scissors', 
            'パー': 'paper'
        };

        // 勝敗結果を計算
        let player1_result, player2_result;
        if (result === 'draw') {
            player1_result = 'draw';
            player2_result = 'draw';
        } else if (winner === '1') {
            player1_result = 'win';
            player2_result = 'lose';
        } else if (winner === '2') {
            player1_result = 'lose';
            player2_result = 'win';
        }

        // マッチタイプを決定（デフォルトはrandom）
        const match_type = 'random';

        const matchHistory = {
            player1_id: player1Id,
            player2_id: player2Id,
            player1_hand: handMapping[player1Hand] || player1Hand,
            player2_hand: handMapping[player2Hand] || player2Hand,
            player1_result: player1_result,
            player2_result: player2_result,
            winner: parseInt(winner) || 0,
            draw_count: 0, // 現在のラウンドでの引き分け回数（通常は0）
            match_type: match_type,
            created_at: new Date(),
            finished_at: result !== 'draw' ? new Date() : null
        };

        console.log(`💾 マッチ履歴保存:`, matchHistory);

        return await this.create('match_history', matchHistory);
    }

    /**
     * マッチを辞退する
     */
    async quitMatch(matchingId, userId) {
        const redis = await this.getRedisConnection();
        const matchKey = `match:${matchingId}`;
        
        try {
            const matchData = await this.getMatchData(matchingId);
            
            if (!matchData) {
                throw new Error('マッチが見つかりません');
            }

            // プレイヤーが参加しているかチェック
            if (matchData.player1_id !== userId && matchData.player2_id !== userId) {
                throw new Error('このマッチに参加していません');
            }

            // 辞退者と相手を特定
            const isPlayer1 = matchData.player1_id === userId;
            const quitterId = userId;
            const opponentId = isPlayer1 ? matchData.player2_id : matchData.player1_id;

            // マッチデータを辞退状態に更新
            const updatedMatchData = {
                ...matchData,
                game_status: "cancelled",
                quit_by: quitterId,
                quit_at: new Date().toISOString(),
                lastUpdateTime: Date.now().toString()
            };

            // 相手がいる場合は結果を設定
            if (opponentId) {
                updatedMatchData.result = JSON.stringify({
                    quit_by: quitterId,
                    winner: isPlayer1 ? '2' : '1', // 辞退していない方が勝者
                    player1_result: isPlayer1 ? 'quit' : 'win',
                    player2_result: isPlayer1 ? 'win' : 'quit',
                    is_draw: false,
                    is_finished: true,
                    quit_at: new Date().toISOString()
                });
            }

            await this.saveMatchData(matchingId, updatedMatchData);
            
            console.log(`🚪 プレイヤー ${userId} がマッチ ${matchingId} を辞退しました`);
            
            return {
                success: true,
                matchingId: matchingId,
                quitterId: quitterId,
                opponentId: opponentId,
                message: "マッチを辞退しました"
            };

        } catch (error) {
            console.error("マッチ辞退エラー:", error);
            throw error;
        }
    }

    /**
     * マッチを強制終了（タイムアウトや接続切れ時）
     */
    async forceEndMatch(matchingId, reason = "timeout") {
        const redis = await this.getRedisConnection();
        const matchKey = `match:${matchingId}`;
        
        try {
            const matchData = await this.getMatchData(matchingId);
            
            if (!matchData) {
                console.log(`⚠️ 強制終了対象のマッチが見つかりません: ${matchingId}`);
                return null;
            }

            // マッチデータを強制終了状態に更新
            const updatedMatchData = {
                ...matchData,
                game_status: "force_ended",
                end_reason: reason,
                ended_at: new Date().toISOString(),
                lastUpdateTime: Date.now().toString()
            };

            await this.saveMatchData(matchingId, updatedMatchData);
            
            console.log(`🔚 マッチ ${matchingId} を強制終了しました (理由: ${reason})`);
            
            return {
                success: true,
                matchingId: matchingId,
                reason: reason,
                message: "マッチが強制終了されました"
            };

        } catch (error) {
            console.error("マッチ強制終了エラー:", error);
            throw error;
        }
    }
}

module.exports = MatchModel; 