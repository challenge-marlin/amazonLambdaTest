const UserStatsModel = require('../models/UserStatsModel');
const ResponseService = require('../services/ResponseService');
const ValidationService = require('../services/ValidationService');

class UserStatsController {
    constructor() {
        this.userStatsModel = new UserStatsModel();
    }

    /**
     * ユーザー統計情報取得
     */
    async getUserStats(userId) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            const userStats = await this.userStatsModel.getUserStats(userId);

            if (!userStats) {
                return ResponseService.notFound("指定されたユーザーの統計情報が見つかりません");
            }

            // レスポンス用のデータ整形
            const responseData = {
                userId: userStats.user_id,
                nickname: userStats.nickname || '',
                name: userStats.name || '',
                totalWins: userStats.total_wins || 0,
                currentWinStreak: userStats.current_win_streak || 0,
                maxWinStreak: userStats.max_win_streak || 0,
                handStats: {
                    rock: userStats.hand_stats_rock || 0,
                    scissors: userStats.hand_stats_scissors || 0,
                    paper: userStats.hand_stats_paper || 0
                },
                favoriteHand: userStats.favorite_hand || '',
                recentHandResults: userStats.recent_hand_results_str || '',
                dailyStats: {
                    wins: userStats.daily_wins || 0,
                    losses: userStats.daily_losses || 0,
                    draws: userStats.daily_draws || 0
                },
                title: userStats.title || '',
                availableTitles: userStats.available_titles || '',
                alias: userStats.alias || '',
                showTitle: userStats.show_title || false,
                showAlias: userStats.show_alias || false,
                userRank: userStats.user_rank || 0,
                rankingPoints: userStats.ranking_points || 0,
                winRate: userStats.win_rate || 0,
                totalMatches: userStats.total_matches || 0
            };

            return ResponseService.success({ userStats: responseData });

        } catch (error) {
            console.error("ユーザー統計取得エラー:", error);
            return ResponseService.error("ユーザー統計取得中にエラーが発生しました");
        }
    }

    /**
     * ユーザー統計情報更新
     */
    async updateUserStats(userId, updateData) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // 更新可能なフィールドを制限
            const allowedFields = ['title', 'alias', 'show_title', 'show_alias'];
            const filteredData = {};
            
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });

            if (Object.keys(filteredData).length === 0) {
                return ResponseService.validationError("更新可能なフィールドが指定されていません");
            }

            // 統計情報を更新
            await this.userStatsModel.updateUserStats(userId, filteredData);

            // 更新後の統計情報を取得
            const updatedStats = await this.userStatsModel.getUserStats(userId);

            if (!updatedStats) {
                return ResponseService.notFound("ユーザーが見つかりません");
            }

            return ResponseService.success({ 
                message: "ユーザー統計情報が更新されました",
                userStats: updatedStats 
            });

        } catch (error) {
            console.error("ユーザー統計更新エラー:", error);
            return ResponseService.error("ユーザー統計更新中にエラーが発生しました");
        }
    }

    /**
     * 戦績更新（マッチ結果による）
     */
    async updateMatchResult(userId, result, hand = null) {
        try {
            if (!userId || !result) {
                return ResponseService.validationError("ユーザーIDと結果は必須です");
            }

            const validResults = ['win', 'lose', 'draw'];
            if (!validResults.includes(result)) {
                return ResponseService.validationError("結果は 'win', 'lose', 'draw' のいずれかである必要があります");
            }

            // 戦績更新
            switch (result) {
                case 'win':
                    await this.userStatsModel.incrementWins(userId);
                    await this.userStatsModel.updateRankingPoints(userId, 10); // 勝利で10ポイント
                    break;
                case 'lose':
                    await this.userStatsModel.incrementLosses(userId);
                    await this.userStatsModel.updateRankingPoints(userId, -5); // 敗北で-5ポイント
                    break;
                case 'draw':
                    await this.userStatsModel.incrementDraws(userId);
                    await this.userStatsModel.updateRankingPoints(userId, 1); // 引き分けで1ポイント
                    break;
            }

            // 手の統計を更新
            if (hand) {
                await this.userStatsModel.updateHandStats(userId, hand);
                await this.userStatsModel.updateFavoriteHand(userId);
            }

            // 最近の結果履歴を更新
            const resultChar = result === 'win' ? 'W' : result === 'lose' ? 'L' : 'D';
            await this.userStatsModel.updateRecentHandResults(userId, resultChar);

            return ResponseService.success({ 
                message: "戦績が更新されました",
                result: result 
            });

        } catch (error) {
            console.error("戦績更新エラー:", error);
            return ResponseService.error("戦績更新中にエラーが発生しました");
        }
    }

    /**
     * ユーザーランキング取得
     */
    async getUserRanking(limit = 10) {
        try {
            const ranking = await this.userStatsModel.getUserRanking(limit);

            const responseData = ranking.map((user, index) => ({
                rank: index + 1,
                userId: user.user_id,
                nickname: user.nickname || '',
                rankingPoints: user.ranking_points || 0,
                totalWins: user.total_wins || 0,
                winRate: user.win_rate || 0,
                title: user.title || '',
                alias: user.alias || '',
                userRank: user.user_rank || 0
            }));

            return ResponseService.success({ ranking: responseData });

        } catch (error) {
            console.error("ランキング取得エラー:", error);
            return ResponseService.error("ランキング取得中にエラーが発生しました");
        }
    }

    /**
     * デイリーランキング取得
     */
    async getDailyRanking(limit = 10) {
        try {
            const ranking = await this.userStatsModel.getDailyRanking(limit);

            const responseData = ranking.map((user, index) => ({
                rank: index + 1,
                userId: user.user_id,
                nickname: user.nickname || '',
                dailyWins: user.daily_wins || 0,
                dailyLosses: user.daily_losses || 0,
                dailyDraws: user.daily_draws || 0,
                title: user.title || '',
                alias: user.alias || ''
            }));

            return ResponseService.success({ dailyRanking: responseData });

        } catch (error) {
            console.error("デイリーランキング取得エラー:", error);
            return ResponseService.error("デイリーランキング取得中にエラーが発生しました");
        }
    }

    /**
     * デイリー統計リセット（管理者用）
     */
    async resetDailyStats() {
        try {
            await this.userStatsModel.resetDailyStats();

            return ResponseService.success({ 
                message: "デイリー統計がリセットされました" 
            });

        } catch (error) {
            console.error("デイリー統計リセットエラー:", error);
            return ResponseService.error("デイリー統計リセット中にエラーが発生しました");
        }
    }
}

module.exports = UserStatsController; 