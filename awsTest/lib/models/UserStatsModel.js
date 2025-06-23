const BaseModel = require('./BaseModel');

class UserStatsModel extends BaseModel {
    /**
     * ユーザー統計情報取得
     */
    async getUserStats(userId) {
        const query = `
            SELECT 
                us.*,
                u.nickname,
                u.name
            FROM user_stats us
            LEFT JOIN users u ON us.management_code = u.management_code
            WHERE u.user_id = ?
        `;
        return await this.findOne(query, [userId]);
    }

    /**
     * 管理コードによるユーザー統計情報取得
     */
    async getUserStatsByManagementCode(managementCode) {
        const query = `
            SELECT us.*, u.nickname, u.name, u.user_id
            FROM user_stats us
            LEFT JOIN users u ON us.management_code = u.management_code
            WHERE us.management_code = ?
        `;
        return await this.findOne(query, [managementCode]);
    }

    /**
     * ユーザー統計情報更新
     */
    async updateUserStats(userId, updateData) {
        // ユーザーのmanagement_codeを取得
        const user = await this.findOne(
            'SELECT management_code FROM users WHERE user_id = ?', 
            [userId]
        );

        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }

        // updated_atを追加
        updateData.updated_at = new Date();

        return await this.update(
            'user_stats', 
            updateData, 
            'management_code = ?', 
            [user.management_code]
        );
    }

    /**
     * 戦績情報更新（勝利時）
     */
    async incrementWins(userId) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.total_wins = us.total_wins + 1,
                us.current_win_streak = us.current_win_streak + 1,
                us.max_win_streak = GREATEST(us.max_win_streak, us.current_win_streak + 1),
                us.daily_wins = us.daily_wins + 1,
                us.total_matches = us.total_matches + 1,
                us.win_rate = ROUND((us.total_wins + 1) / (us.total_matches + 1) * 100, 2),
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [userId]);
    }

    /**
     * 戦績情報更新（敗北時）
     */
    async incrementLosses(userId) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.current_win_streak = 0,
                us.daily_losses = us.daily_losses + 1,
                us.total_matches = us.total_matches + 1,
                us.win_rate = ROUND(us.total_wins / (us.total_matches + 1) * 100, 2),
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [userId]);
    }

    /**
     * 戦績情報更新（引き分け時）
     */
    async incrementDraws(userId) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.daily_draws = us.daily_draws + 1,
                us.total_matches = us.total_matches + 1,
                us.win_rate = ROUND(us.total_wins / (us.total_matches + 1) * 100, 2),
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [userId]);
    }

    /**
     * 手の統計情報更新
     */
    async updateHandStats(userId, hand) {
        const handColumns = {
            'グー': 'hand_stats_rock',
            'チョキ': 'hand_stats_scissors', 
            'パー': 'hand_stats_paper'
        };

        const column = handColumns[hand];
        if (!column) {
            return;
        }

        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.${column} = us.${column} + 1,
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [userId]);
    }

    /**
     * お気に入りの手を更新
     */
    async updateFavoriteHand(userId) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET us.favorite_hand = (
                CASE 
                    WHEN us.hand_stats_rock >= us.hand_stats_scissors AND us.hand_stats_rock >= us.hand_stats_paper THEN 'グー'
                    WHEN us.hand_stats_scissors >= us.hand_stats_paper THEN 'チョキ'
                    ELSE 'パー'
                END
            ),
            us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [userId]);
    }

    /**
     * 最近の手の結果履歴を更新
     */
    async updateRecentHandResults(userId, result) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.recent_hand_results_str = CONCAT(
                    SUBSTRING(CONCAT(us.recent_hand_results_str, ?), -9, 9)
                ),
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [result, userId]);
    }

    /**
     * ランキングポイント更新
     */
    async updateRankingPoints(userId, points) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.ranking_points = us.ranking_points + ?,
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [points, userId]);
    }

    /**
     * ユーザーランキング取得
     */
    async getUserRanking(limit = 10) {
        const query = `
            SELECT 
                u.user_id,
                u.nickname,
                us.ranking_points,
                us.total_wins,
                us.win_rate,
                us.title,
                us.alias,
                us.user_rank
            FROM user_stats us
            JOIN users u ON us.management_code = u.management_code
            ORDER BY us.ranking_points DESC
            LIMIT ?
        `;
        return await this.findMany(query, [limit]);
    }

    /**
     * デイリーランキング取得
     */
    async getDailyRanking(limit = 10) {
        const query = `
            SELECT 
                u.user_id,
                u.nickname,
                us.daily_wins,
                us.daily_losses,
                us.daily_draws,
                us.title,
                us.alias
            FROM user_stats us
            JOIN users u ON us.management_code = u.management_code
            ORDER BY us.daily_wins DESC, us.daily_losses ASC
            LIMIT ?
        `;
        return await this.findMany(query, [limit]);
    }

    /**
     * デイリー統計リセット
     */
    async resetDailyStats() {
        const query = `
            UPDATE user_stats 
            SET 
                daily_wins = 0,
                daily_losses = 0,
                daily_draws = 0,
                updated_at = NOW()
        `;
        return await this.executeQuery(query);
    }

    /**
     * 表示設定更新
     */
    async updateDisplaySettings(userId, { showTitle, showAlias }) {
        const query = `
            UPDATE user_stats us
            JOIN users u ON us.management_code = u.management_code
            SET 
                us.show_title = ?,
                us.show_alias = ?,
                us.updated_at = NOW()
            WHERE u.user_id = ?
        `;
        return await this.executeQuery(query, [showTitle, showAlias, userId]);
    }
}

module.exports = UserStatsModel; 