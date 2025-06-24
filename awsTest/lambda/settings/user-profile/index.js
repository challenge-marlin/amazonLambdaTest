const UserController = require('../../../lib/controllers/UserController');
const ResponseService = require('../../../lib/services/ResponseService');

const userController = new UserController();

exports.handler = async (event, context) => {
    console.log("Settings User Profile Event:", JSON.stringify(event, null, 2));

    try {
        // パスパラメータからuserIdを取得
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return ResponseService.validationError("ユーザーIDは必須です");
        }

        // HTTPメソッドに応じた処理
        switch (event.httpMethod) {
            case 'GET':
                // プロフィール情報を取得
                console.log(`🔍 設定画面用プロフィール取得開始 - userId: ${userId}`);
                const profileData = await userController.getSettingsUserProfile(userId);
                console.log(`📋 取得結果:`, profileData);
                
                if (!profileData) {
                    console.log(`❌ ユーザーが見つかりません - userId: ${userId}`);
                    return ResponseService.notFound("指定されたユーザーが見つかりません");
                }
                
                console.log(`✅ 設定画面用プロフィール取得成功 - userId: ${userId}`);
                return ResponseService.success(profileData);

            case 'PUT':
                // リクエストボディの解析
                let updateData;
                try {
                    updateData = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }

                // プロフィール情報を更新
                const updateResult = await userController.updateUserProfile(userId, updateData);
                if (updateResult.success === false) {
                    return updateResult;
                }

                // 更新後のプロフィール情報を取得
                const updatedProfileData = await userController.getSettingsUserProfile(userId);
                return ResponseService.success(updatedProfileData);

            default:
                return ResponseService.error("Method not allowed", 405);
        }

    } catch (error) {
        console.error("設定画面ユーザープロフィール処理エラー:", error);
        return ResponseService.error("プロフィール処理中にエラーが発生しました");
    }
}; 