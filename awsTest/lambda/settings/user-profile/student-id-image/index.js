const UserController = require('../../../../lib/controllers/UserController');
const fileStorage = require('../../../../utils/fileStorage');
const ResponseService = require('../../../../lib/services/ResponseService');

exports.handler = async (event) => {
    const userController = new UserController();
    
    try {
        // パスパラメータからユーザーIDを取得
        const userId = event.pathParameters?.userId;
        
        // ファイルデータをBase64からバッファに変換
        const fileData = JSON.parse(event.body || '{}');
        const buffer = Buffer.from(fileData.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        // ファイルオブジェクトの作成
        const file = {
            buffer: buffer,
            mimetype: fileData.contentType || 'image/jpeg',
            originalname: fileData.fileName || `student-id-${Date.now()}.jpg`
        };

        // 画像をアップロード
        const uploadResult = await fileStorage.uploadImage(userId, file, 'studentId');

        if (!uploadResult.success) {
            return ResponseService.error("画像のアップロードに失敗しました");
        }

        // ユーザー情報を更新
        const updateResult = await userController.updateUserProfile(userId, {
            student_id_image_url: uploadResult.url
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
                    studentIdImageUrl: uploadResult.url,
                    updatedAt: new Date().toISOString()
                }
            })
        };

    } catch (error) {
        console.error('Error in student ID image upload:', error);
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