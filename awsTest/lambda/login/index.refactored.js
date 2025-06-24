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
            const UserController = require('../../lib/controllers/UserController');
            const ResponseService = require('../../lib/services/ResponseService');
            return ResponseService.validationError("Invalid JSON format");
        }

        // UserControllerを使用してログイン処理
        const result = await userController.login(body);
        
        return result;

    } catch (error) {
        console.error("ログイン処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("ログイン処理中にエラーが発生しました");
    }
}; 