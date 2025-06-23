const UserController = require('../../lib/controllers/UserController');
const ResponseService = require('../../lib/services/ResponseService');

const userController = new UserController();

exports.handler = async (event, context) => {
    console.log("Login Event Data:", JSON.stringify(event, null, 2));

    try {
        // リクエストボディの解析
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            return ResponseService.validationError("Invalid JSON format");
        }

        // UserControllerを使用してログイン処理
        const result = await userController.login(body);
        
        // レスポンス形式を統一
        if (result.statusCode === 200) {
            const responseData = JSON.parse(result.body);
            return ResponseService.success({
                user: responseData.data.user
            });
        }
        
        return result;

    } catch (error) {
        console.error("ログイン処理エラー:", error);
        return ResponseService.error("ログイン処理中にエラーが発生しました");
    }
}; 