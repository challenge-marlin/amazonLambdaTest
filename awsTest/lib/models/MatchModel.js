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
        if (!this.redis) {
            this.redis = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                password: process.env.REDIS_PASSWORD || '',
                retryStrategy: (times) => {
                    return Math.min(times * 100, 3000);
                }
            });
        }
        return this.redis;
    }

    /**
     * Redis接続をクローズ
     */
    async closeRedis() {
        if (this.redis) {
            await this.redis.quit();
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
     * マッチデータ保存
     */
    async saveMatchData(matchingId, matchData) {
        const redis = await this.getRedisConnection();
        const matchKey = `match:${matchingId}`;
        try {
            await redis.hmset(matchKey, matchData);
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
        const matchData = await this.getMatchData(matchingId);
        
        if (!matchData) {
            throw new Error('マッチが見つかりません');
        }

        if (matchData.game_status === "finished") {
            throw new Error('このマッチは既に終了しています');
        }

        // 手の履歴を取得・更新
        const handHistoryKey = `${userId}_hand_history`;
        const handHistory = matchData[handHistoryKey] ? JSON.parse(matchData[handHistoryKey]) : [];
        
        // 相手プレイヤーの手履歴を取得
        const otherPlayerId = matchData.player1_id === userId ? matchData.player2_id : matchData.player1_id;
        if (otherPlayerId) {
            const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
            const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
            
            // 重複送信チェック
            if (handHistory.length > otherHandHistory.length) {
                throw new Error('既にこのラウンドの手を送信済みです。相手の手を待ってください。');
            }
        }

        // 手を履歴に追加
        handHistory.push(hand);

        // 両プレイヤーの手が揃ったかチェック
        let gameStatus = "waiting";
        let canJudge = false;

        if (matchData.player1_id && matchData.player2_id && otherPlayerId) {
            const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
            const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
            
            if (handHistory.length === otherHandHistory.length && handHistory.length > 0) {
                gameStatus = "ready";
                canJudge = true;
            }
        }

        // マッチデータを更新
        const updatedMatchData = {
            ...matchData,
            [handHistoryKey]: JSON.stringify(handHistory),
            game_status: gameStatus,
            lastUpdateTime: Date.now().toString()
        };

        await this.saveMatchData(matchingId, updatedMatchData);

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
        }

        await this.saveMatchData(matchingId, updatedMatchData);

        return {
            player1: {
                id: matchData.player1_id,
                hand: player1Hand
            },
            player2: {
                id: matchData.player2_id,
                hand: player2Hand
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
        const matchHistory = {
            matching_id: matchingId,
            player1_id: player1Id,
            player2_id: player2Id,
            player1_hand: player1Hand,
            player2_hand: player2Hand,
            result: result,
            winner: winner,
            created_at: new Date()
        };

        return await this.create('match_history', matchHistory);
    }
}

module.exports = MatchModel; 