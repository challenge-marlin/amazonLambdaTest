const UserController = require('../../lib/controllers/UserController');

const userController = new UserController();

exports.handler = async (event, context) => {
    console.log("Login Event Data:", JSON.stringify(event, null, 2));

    try {
        // リクエストボディの解析
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            const ResponseService = require('../../lib/services/ResponseService');
            return ResponseService.validationError("Invalid JSON format");
        }

        // UserControllerを使用してユーザーIDチェック処理
        const result = await userController.checkUserId(body);
        
        return result;

    } catch (error) {
        console.error("チェック処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("チェック処理中にエラーが発生しました");
    }
}; 