const UserController = require('../../../../lib/controllers/UserController');
const ResponseService = require('../../../../lib/services/ResponseService');

exports.handler = async (event) => {
    const userController = new UserController();
    
    try {
        // パスパラメータからユーザーIDを取得
        const userId = event.pathParameters?.userId;
        
        // リクエストボディをパース
        const body = JSON.parse(event.body || '{}');
        const { title, alias } = body;

        // バリデーション
        if (!title && !alias) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        message: "称号または二つ名のいずれかは必須です"
                    }
                })
            };
        }

        // ユーザープロフィールを更新
        const updateResult = await userController.updateUserProfile(userId, {
            title: title,
            alias: alias
        });

        return {
            statusCode: updateResult.success ? 200 : updateResult.error?.code || 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: {
                    profile: {
                        userId: userId,
                        title: title,
                        alias: alias,
                        updatedAt: new Date().toISOString()
                    }
                }
            })
        };

    } catch (error) {
        console.error('Error in title/alias update:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: {
                    message: 'Internal server error',
                    details: error.message
                }
            })
        };
    }
}; 