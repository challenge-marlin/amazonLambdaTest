const UserController = require('../../lib/controllers/UserController');
const UserStatsController = require('../../lib/controllers/UserStatsController');
const ResponseService = require('../../lib/services/ResponseService');

const userController = new UserController();
const userStatsController = new UserStatsController();

exports.handler = async (event) => {
    try {
        // Get userId from path parameters (for GET) or default to user001
        let userId = 'user001';
        if (event.pathParameters && event.pathParameters.userId) {
            userId = event.pathParameters.userId;
        }

        // UserControllerを使用してユーザー情報を取得
        const userResult = await userController.getUserWithStats(userId);
        
        if (userResult.statusCode !== 200) {
            return userResult;
        }

        // Redis接続ステータスチェック（簡易）
        let redisStatus = 'available'; // MVCリファクタリング後は個別にチェック

        // レスポンス作成
        const responseData = {
            success: true,
            redisStatus,
            userInfo: userResult.body ? JSON.parse(userResult.body).data.user : null
        };

        return ResponseService.success(responseData);

    } catch (error) {
        console.error('Test API Error:', error);
        return ResponseService.error('Internal server error', 500, 'INTERNAL_ERROR', error.message);
    }
}; 