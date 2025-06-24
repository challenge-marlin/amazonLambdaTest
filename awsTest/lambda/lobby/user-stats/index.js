const UserController = require('../../../lib/controllers/UserController');
const ResponseService = require('../../../lib/services/ResponseService');

const userController = new UserController();

exports.handler = async (event, context) => {
    console.log("Lobby User Stats Event:", JSON.stringify(event, null, 2));

    try {
        // パスパラメータからuserIdを取得
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return ResponseService.validationError("ユーザーIDは必須です");
        }

        // HTTPメソッドによる処理の分岐
        switch (event.httpMethod) {
            case 'GET':
                // ロビー用ユーザーステータス取得
                const statsData = await userController.getLobbyUserStats(userId);
                if (!statsData) {
                    return ResponseService.notFound("指定されたユーザーが見つかりません");
                }
                return ResponseService.success(statsData);

            case 'PUT':
                // パスの確認
                const path = event.path;
                if (path.endsWith('/display')) {
                    // 表示設定更新
                    let displaySettings;
                    try {
                        displaySettings = JSON.parse(event.body);
                    } catch (err) {
                        return ResponseService.validationError("Invalid JSON format");
                    }
                    return await userController.updateDisplaySettings(userId, displaySettings);
                }
                return ResponseService.notFound("指定されたエンドポイントが見つかりません");

            default:
                return ResponseService.methodNotAllowed("許可されていないHTTPメソッドです");
        }

    } catch (error) {
        console.error("Lobby User Stats API Error:", error);
        return ResponseService.error("ユーザーステータス操作中にエラーが発生しました");
    }
}; 