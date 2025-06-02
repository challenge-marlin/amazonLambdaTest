const UserModel = require('../models/UserModel');
const ResponseService = require('../services/ResponseService');
const ValidationService = require('../services/ValidationService');

class UserController {
    constructor() {
        this.userModel = new UserModel();
    }

    /**
     * ユーザーログイン
     */
    async login(requestData) {
        try {
            console.log("ユーザー認証処理開始 - UserId:", requestData.userId);

            // バリデーション
            const validation = ValidationService.validateLoginRequest(requestData);
            if (!validation.isValid) {
                return ResponseService.validationError(
                    validation.errors.join(', '),
                    validation.errors
                );
            }

            const { userId, password } = requestData;

            // ユーザー認証
            const user = await this.userModel.authenticateUser(userId, password);

            if (!user) {
                return ResponseService.authenticationError();
            }

            console.log("ユーザー認証成功:", user.user_id);

            // レスポンス用のユーザーデータを整形
            const responseUser = {
                user_id: user.user_id,
                nickname: user.nickname || '',
                title: user.title || '',
                alias: user.alias || '',
                profile_image_url: user.profile_image_url || ''
            };

            return ResponseService.loginSuccess(responseUser);

        } catch (error) {
            console.error("ログイン処理エラー:", error);
            return ResponseService.error("ログイン処理中にエラーが発生しました");
        }
    }

    /**
     * ユーザープロフィール取得
     */
    async getUserProfile(userId) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            const user = await this.userModel.getUserProfile(userId);

            if (!user) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            return ResponseService.success({ user });

        } catch (error) {
            console.error("プロフィール取得エラー:", error);
            return ResponseService.error("プロフィール取得中にエラーが発生しました");
        }
    }

    /**
     * ユーザープロフィール更新
     */
    async updateUserProfile(userId, updateData) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // バリデーション
            const validation = ValidationService.validateUserProfileUpdate(updateData);
            if (!validation.isValid) {
                return ResponseService.validationError(
                    validation.errors.join(', '),
                    validation.errors
                );
            }

            // 更新するフィールドがあるかチェック
            if (Object.keys(updateData).length === 0) {
                return ResponseService.validationError("更新するフィールドが指定されていません");
            }

            // ユーザーの存在確認
            const userExists = await this.userModel.userExists(userId);
            if (!userExists) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            // プロフィール更新
            await this.userModel.updateUserProfile(userId, updateData);

            // 更新後のユーザー情報を取得
            const updatedUser = await this.userModel.getUserProfile(userId);

            return ResponseService.success({ user: updatedUser });

        } catch (error) {
            console.error("プロフィール更新エラー:", error);
            return ResponseService.error("プロフィール更新中にエラーが発生しました");
        }
    }

    /**
     * プロフィール画像アップロード
     */
    async uploadProfileImage(userId, fileData) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // ファイルサイズチェック（5MB制限）
            if (fileData && fileData.length > 5 * 1024 * 1024) {
                return ResponseService.validationError("ファイルサイズは5MB以下である必要があります");
            }

            // ユーザーの存在確認
            const userExists = await this.userModel.userExists(userId);
            if (!userExists) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            // 実際の実装では、S3にアップロードする処理を行う
            // ここでは簡易的にダミーURLを返す
            const imageUrl = `https://example.com/profile-images/${userId}/${Date.now()}.jpg`;

            // プロフィール画像URLを更新
            await this.userModel.updateProfileImage(userId, imageUrl);

            return ResponseService.success({
                message: "プロフィール画像がアップロードされました",
                profileImageUrl: imageUrl
            });

        } catch (error) {
            console.error("プロフィール画像アップロードエラー:", error);
            return ResponseService.error("プロフィール画像アップロード中にエラーが発生しました");
        }
    }

    /**
     * ユーザー情報とステータスの統合取得
     */
    async getUserWithStats(userId) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            const user = await this.userModel.getUserWithStats(userId);

            if (!user) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            return ResponseService.success({ user });

        } catch (error) {
            console.error("ユーザー情報取得エラー:", error);
            return ResponseService.error("ユーザー情報取得中にエラーが発生しました");
        }
    }

    /**
     * ユーザーID重複チェック
     */
    async checkUserId(requestData) {
        try {
            console.log("ユーザーID重複チェック処理開始 - RequestData:", requestData);

            // バリデーション
            if (!requestData || !requestData.userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            const { userId } = requestData;

            // ユーザーIDの存在確認
            const userExists = await this.userModel.userExists(userId);

            if (userExists) {
                // HTTPステータスコード409 (Conflict) を使用
                return ResponseService.businessError("このユーザーIDは既に使用されています。", 'USER_ID_ALREADY_EXISTS', 409);
            }

            return ResponseService.success({ message: "このユーザーIDは使用可能です" });

        } catch (error) {
            console.error("ユーザーID重複チェック処理エラー:", error);
            return ResponseService.error("ユーザーID重複チェック処理中にエラーが発生しました");
        }
    }
}

module.exports = UserController; 