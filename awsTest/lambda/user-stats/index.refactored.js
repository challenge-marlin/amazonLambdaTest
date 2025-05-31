const UserStatsController = require('../../lib/controllers/UserStatsController');

const userStatsController = new UserStatsController();

exports.handler = async (event, context) => {
    try {
        const httpMethod = event.httpMethod;
        const path = event.path;
        const pathParameters = event.pathParameters || {};

        // ルーティング処理
        if (httpMethod === 'GET' && path.includes('/api/user-stats/')) {
            // ユーザー統計情報取得
            const userId = pathParameters.userId;
            return await userStatsController.getUserStats(userId);

        } else if (httpMethod === 'PUT' && path.includes('/api/user-stats/')) {
            // ユーザー統計情報更新
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (err) {
                const ResponseService = require('../../lib/services/ResponseService');
                return ResponseService.validationError("Invalid JSON format");
            }

            const userId = pathParameters.userId;
            return await userStatsController.updateUserStats(userId, body);

        } else if (httpMethod === 'GET' && path === '/api/ranking') {
            // ユーザーランキング取得
            const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 10;
            return await userStatsController.getUserRanking(limit);

        } else if (httpMethod === 'GET' && path === '/api/daily-ranking') {
            // デイリーランキング取得
            const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit) : 10;
            return await userStatsController.getDailyRanking(limit);

        } else if (httpMethod === 'POST' && path === '/api/match-result') {
            // 戦績更新
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (err) {
                const ResponseService = require('../../lib/services/ResponseService');
                return ResponseService.validationError("Invalid JSON format");
            }

            const { userId, result, hand } = body;
            return await userStatsController.updateMatchResult(userId, result, hand);

        } else if (httpMethod === 'POST' && path === '/api/reset-daily-stats') {
            // デイリー統計リセット（管理者用）
            return await userStatsController.resetDailyStats();

        } else {
            const ResponseService = require('../../lib/services/ResponseService');
            return ResponseService.notFound("エンドポイントが見つかりません");
        }

    } catch (error) {
        console.error("ユーザー統計API処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("ユーザー統計API処理中にエラーが発生しました");
    }
}; 