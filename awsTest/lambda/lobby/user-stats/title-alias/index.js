const UserController = require('../../../../lib/controllers/UserController');
const ResponseService = require('../../../../lib/services/ResponseService');

const userController = new UserController();

exports.handler = async (event, context) => {
    console.log("Title Alias Update Event:", JSON.stringify(event, null, 2));

    try {
        // パスパラメータからuserIdを取得
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return ResponseService.validationError("ユーザーIDは必須です");
        }

        // リクエストボディの解析
        let updateData;
        try {
            updateData = JSON.parse(event.body);
        } catch (err) {
            return ResponseService.validationError("Invalid JSON format");
        }

        // 称号と二つ名の更新（UserControllerが既にResponseServiceを返す）
        return await userController.updateTitleAlias(userId, updateData);

    } catch (error) {
        console.error("称号・二つ名更新エラー:", error);
        return ResponseService.error("称号・二つ名の更新中にエラーが発生しました");
    }
}; 