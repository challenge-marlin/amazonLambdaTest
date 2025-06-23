const UserController = require('../../../../../lib/controllers/UserController');
const fileStorage = require('../../../../../utils/fileStorage');
const ResponseService = require('../../../../../lib/services/ResponseService');

exports.handler = async (event) => {
    const userController = new UserController();
    
    try {
        // パスパラメータからユーザーIDを取得
        const userId = event.pathParameters?.userId;
        
        // クエリパラメータから画像タイプを取得
        const imageType = event.queryStringParameters?.type || 'profile';
        
        // ユーザー情報を取得
        const user = await userController.getUserProfile(userId);
        if (!user.success) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        message: "ユーザーが見つかりません"
                    }
                })
            };
        }

        // 画像URLから画像のパスを抽出
        const imageUrl = imageType === 'profile' ? user.data.profileImageUrl : user.data.studentIdImageUrl;
        if (!imageUrl) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: {
                        message: "画像が見つかりません"
                    }
                })
            };
        }

        // MinIOから画像を削除
        const bucket = imageType === 'profile' ? fileStorage.buckets.profile : fileStorage.buckets.studentId;
        const fileName = imageUrl.split('/').pop();
        await fileStorage.deleteImage(bucket, fileName);

        // ユーザー情報を更新
        const updateData = {};
        if (imageType === 'profile') {
            updateData.profile_image_url = null;
        } else {
            updateData.student_id_image_url = null;
        }
        await userController.updateUserProfile(userId, updateData);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: {
                    message: "画像が正常に削除されました",
                    imageType: imageType,
                    updatedAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('Error in image deletion:', error);
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