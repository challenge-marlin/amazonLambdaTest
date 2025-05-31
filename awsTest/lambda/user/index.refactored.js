const UserController = require('../../lib/controllers/UserController');

const userController = new UserController();

exports.handler = async (event, context) => {
    try {
        const httpMethod = event.httpMethod;
        const path = event.path;

        // ルーティング処理
        if (httpMethod === 'GET' && path === '/api/user') {
            // ユーザープロフィール取得
            // 本来はJWTなどからuserIdを取得するが、ここではクエリパラメータから取得
            const userId = event.queryStringParameters?.userId;
            return await userController.getUserProfile(userId);

        } else if (httpMethod === 'PUT' && path === '/api/user') {
            // ユーザープロフィール更新
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (err) {
                const ResponseService = require('../../lib/services/ResponseService');
                return ResponseService.validationError("Invalid JSON format");
            }

            // 本来はJWTなどからuserIdを取得するが、ここではbodyから取得
            const userId = body.userId;
            delete body.userId; // updateDataからuserIdを除去

            return await userController.updateUserProfile(userId, body);

        } else if (httpMethod === 'POST' && path === '/api/user/profile-image') {
            // プロフィール画像アップロード
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (err) {
                const ResponseService = require('../../lib/services/ResponseService');
                return ResponseService.validationError("Invalid JSON format");
            }

            const userId = body.userId;
            const fileData = body.fileData;

            return await userController.uploadProfileImage(userId, fileData);

        } else {
            const ResponseService = require('../../lib/services/ResponseService');
            return ResponseService.notFound("エンドポイントが見つかりません");
        }

    } catch (error) {
        console.error("ユーザーAPI処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("ユーザーAPI処理中にエラーが発生しました");
    }
}; 