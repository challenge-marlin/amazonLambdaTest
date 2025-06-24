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

            // ファイルデータの検証
            if (!fileData) {
                return ResponseService.validationError("画像ファイルが必要です");
            }

            // ユーザーの存在確認
            const userExists = await this.userModel.userExists(userId);
            if (!userExists) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            // 画像アップロード処理（MinIOストレージ使用）
            const imageStorage = require('../../utils/fileStorage');
            const uploadResult = await imageStorage.uploadImage(userId, fileData, 'profile');

            if (!uploadResult.success) {
                return ResponseService.error("画像のアップロードに失敗しました");
            }

            // プロフィール画像URLを更新
            await this.userModel.updateProfileImage(userId, uploadResult.url);

            return ResponseService.success({
                profileImageUrl: uploadResult.url
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

    /**
     * ロビー画面用ユーザーステータス取得
     */
    async getLobbyUserStats(userId) {
        try {
            if (!userId) {
                throw new Error("ユーザーIDは必須です");
            }

            const user = await this.userModel.getUserWithStats(userId);
            if (!user) {
                return null;
            }

            // API仕様書に合わせたレスポンス形式（data.statsラッパー）
            const stats = {
                userId: user.user_id,
                nickname: user.nickname || '',
                profileImageUrl: user.profile_image_url || '',
                showTitle: user.show_title || false,
                showAlias: user.show_alias || false,
                winCount: user.total_wins || 0,
                loseCount: user.daily_losses || 0,
                drawCount: user.daily_draws || 0,
                totalMatches: (user.total_wins || 0) + (user.daily_losses || 0) + (user.daily_draws || 0),
                dailyWins: user.daily_wins || 0,
                dailyRank: user.user_rank || 'no_rank',
                dailyRanking: user.daily_ranking || 0,
                recentHandResultsStr: user.recent_hand_results_str || '',
                title: user.title || '',
                availableTitles: user.available_titles || '',
                alias: user.alias || ''
            };

            return { stats };

        } catch (error) {
            console.error("ロビーユーザーステータス取得エラー:", error);
            throw error;
        }
    }

    /**
     * 設定画面用ユーザープロフィール取得
     */
    async getSettingsUserProfile(userId) {
        try {
            if (!userId) {
                throw new Error("ユーザーIDは必須です");
            }

            const user = await this.userModel.getUserWithStats(userId);
            if (!user) {
                return null;
            }

            // API仕様書に合わせた設定画面用のレスポンス形式（data.profileラッパー）
            const profile = {
                userId: user.user_id,
                nickname: user.nickname || '',
                name: user.name || '',
                email: user.email || '',
                profileImageUrl: user.profile_image_url || '',
                studentIdImageUrl: user.student_id_image_url || '',
                title: user.title || '',
                alias: user.alias || '',
                availableTitles: user.available_titles || '',
                university: user.university || '',
                postalCode: user.postal_code || '',
                address: user.address || '',
                phoneNumber: user.phone_number || '',
                isStudentIdEditable: user.is_student_id_editable || false,
                showTitle: user.show_title || false,
                showAlias: user.show_alias || false,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            };

            return { profile };

        } catch (error) {
            console.error("設定画面ユーザープロフィール取得エラー:", error);
            throw error;
        }
    }

    /**
     * 称号と二つ名の更新
     */
    async updateTitleAlias(userId, updateData) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // バリデーション
            if (!updateData.title && !updateData.alias) {
                return ResponseService.validationError("更新するデータが指定されていません");
            }

            // ユーザーの存在確認
            const userExists = await this.userModel.userExists(userId);
            if (!userExists) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            // 称号と二つ名の更新
            await this.userModel.updateTitleAlias(userId, updateData);

            // 更新後のユーザーステータスを取得（API仕様書に合わせてstatsラッパー付き）
            const lobbyStats = await this.getLobbyUserStats(userId);
            
            // API仕様書に合わせたレスポンス形式
            const stats = {
                userId: userId,
                title: updateData.title || '',
                alias: updateData.alias || '',
                updatedAt: new Date().toISOString()
            };

            return ResponseService.success({ stats });

        } catch (error) {
            console.error("称号・二つ名更新エラー:", error);
            return ResponseService.error("称号・二つ名更新中にエラーが発生しました");
        }
    }

    /**
     * 表示設定更新（ロビー画面用）
     */
    async updateDisplaySettings(userId, displaySettings) {
        try {
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // バリデーション
            if (typeof displaySettings.showTitle !== 'boolean' || typeof displaySettings.showAlias !== 'boolean') {
                return ResponseService.validationError("表示設定は真偽値で指定してください");
            }

            // ユーザーの存在確認
            const userExists = await this.userModel.userExists(userId);
            if (!userExists) {
                return ResponseService.notFound("指定されたユーザーが見つかりません");
            }

            // 表示設定の更新
            await this.userModel.updateDisplaySettings(userId, displaySettings);

            // 更新後のユーザーステータスを取得
            const stats = {
                userId: userId,
                showTitle: displaySettings.showTitle,
                showAlias: displaySettings.showAlias,
                updatedAt: new Date().toISOString()
            };

            return ResponseService.success({ stats });

        } catch (error) {
            console.error("表示設定更新エラー:", error);
            return ResponseService.error("表示設定の更新中にエラーが発生しました");
        }
    }
}

module.exports = UserController; 