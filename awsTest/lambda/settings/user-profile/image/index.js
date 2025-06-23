const UserController = require('../../../../lib/controllers/UserController');
const ResponseService = require('../../../../lib/services/ResponseService');
const multer = require('multer');
const sharp = require('sharp');

const userController = new UserController();

// メモリストレージ用のmulter設定
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB制限
    },
    fileFilter: (req, file, cb) => {
        // 画像ファイルのみを許可
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('画像ファイルのみアップロード可能です'), false);
        }
    }
});

exports.handler = async (event, context) => {
    console.log("Profile Image Upload Event:", JSON.stringify(event, null, 2));

    try {
        // パスパラメータからuserIdを取得
        const userId = event.pathParameters?.userId;
        if (!userId) {
            return ResponseService.validationError("ユーザーIDは必須です");
        }

        // VPS環境でのExpress処理とLambda環境での処理を統一
        let fileData;
        
        if (event.file) {
            // Express環境でmulterによって処理されたファイル（VPS環境）
            fileData = event.file;
        } else if (event.isBase64Encoded && event.body) {
            // Lambda環境でのBase64エンコードされたファイルデータ処理
            const buffer = Buffer.from(event.body, 'base64');
            fileData = {
                buffer: buffer,
                originalname: 'uploaded_image.jpg',
                mimetype: 'image/jpeg'
            };
        } else {
            return ResponseService.validationError("画像ファイルが必要です");
        }

        // ファイルサイズチェック
        if (fileData.buffer && fileData.buffer.length > 5 * 1024 * 1024) {
            return ResponseService.validationError("ファイルサイズは5MB以下である必要があります");
        }

        // プロフィール画像のアップロード
        const result = await userController.uploadProfileImage(userId, fileData);
        
        if (result.success === false) {
            return result;
        }

        return ResponseService.success({
            profileImageUrl: result.data.profileImageUrl
        });

    } catch (error) {
        console.error("プロフィール画像アップロードエラー:", error);
        return ResponseService.error("プロフィール画像のアップロード中にエラーが発生しました");
    }
}; 