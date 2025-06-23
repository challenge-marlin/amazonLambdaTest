const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
    /**
     * ユーザー認証（ログイン）
     */
    async authenticateUser(userId, password) {
        const query = `
            SELECT 
                u.user_id,
                u.nickname,
                u.name,
                u.email,
                u.profile_image_url,
                us.title,
                us.alias
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.user_id = ? AND u.password = ?
        `;
        return await this.findOne(query, [userId, password]);
    }

    /**
     * ユーザープロフィール取得
     */
    async getUserProfile(userId) {
        const query = `
            SELECT 
                u.user_id as userId,
                u.nickname,
                u.name,
                u.email,
                u.profile_image_url as profileImageUrl,
                us.title,
                us.alias,
                u.university,
                u.postal_code as postalCode,
                u.address,
                u.phone_number as phoneNumber,
                u.is_student_id_editable as isStudentIdEditable,
                u.created_at as createdAt,
                u.updated_at as updatedAt
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.user_id = ?
        `;
        return await this.findOne(query, [userId]);
    }

    /**
     * ユーザー情報更新
     */
    async updateUserProfile(userId, updateData) {
        // フィールド名をスネークケースに変換
        const fieldMapping = {
            'postalCode': 'postal_code',
            'phoneNumber': 'phone_number'
        };

        const dbData = {};
        Object.keys(updateData).forEach(key => {
            const dbKey = fieldMapping[key] || key;
            dbData[dbKey] = updateData[key];
        });

        // updated_atを追加
        dbData.updated_at = new Date();

        return await this.update('users', dbData, 'user_id = ?', [userId]);
    }

    /**
     * ユーザー存在確認
     */
    async userExists(userId) {
        const query = 'SELECT user_id FROM users WHERE user_id = ?';
        const user = await this.findOne(query, [userId]);
        return user !== null;
    }

    /**
     * プロフィール画像URL更新
     */
    async updateProfileImage(userId, imageUrl) {
        return await this.update(
            'users', 
            { 
                profile_image_url: imageUrl,
                updated_at: new Date()
            }, 
            'user_id = ?', 
            [userId]
        );
    }

    /**
     * 新規ユーザー作成
     */
    async createUser(userData) {
        // 必要に応じてパスワードのハッシュ化処理を追加
        const dbData = {
            ...userData,
            created_at: new Date(),
            updated_at: new Date()
        };
        return await this.create('users', dbData);
    }

    /**
     * ユーザー情報と統計情報を取得
     */
    async getUserWithStats(userId) {
        const query = `
            SELECT 
                u.user_id,
                u.nickname,
                u.name,
                u.email,
                u.profile_image_url,
                u.student_id_image_url,
                u.university,
                u.postal_code,
                u.address,
                u.phone_number,
                u.is_student_id_editable,
                u.created_at,
                u.updated_at,
                us.total_wins,
                us.current_win_streak,
                us.max_win_streak,
                us.hand_stats_rock,
                us.hand_stats_scissors,
                us.hand_stats_paper,
                us.favorite_hand,
                us.recent_hand_results_str,
                us.daily_wins,
                us.daily_losses,
                us.daily_draws,
                us.title,
                us.available_titles,
                us.alias,
                us.show_title,
                us.show_alias,
                us.user_rank,
                us.daily_ranking
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.user_id = ?
        `;
        return await this.findOne(query, [userId]);
    }

    /**
     * 表示設定の更新
     */
    async updateDisplaySettings(userId, displaySettings) {
        try {
            const connection = await this.getConnection();
            
            // ユーザーのmanagement_codeを取得
            const [userRows] = await connection.execute(
                'SELECT management_code FROM users WHERE user_id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                throw new Error('ユーザーが見つかりません');
            }

            const managementCode = userRows[0].management_code;

            // user_statsテーブルの表示設定を更新
            await connection.execute(
                'UPDATE user_stats SET show_title = ?, show_alias = ? WHERE management_code = ?',
                [displaySettings.showTitle, displaySettings.showAlias, managementCode]
            );

            return true;
        } catch (error) {
            console.error('表示設定更新エラー:', error);
            throw error;
        }
    }

    /**
     * 称号と二つ名の更新
     */
    async updateTitleAlias(userId, updateData) {
        try {
            const connection = await this.getConnection();

            // ユーザーのmanagement_codeを取得
            const [userRows] = await connection.execute(
                'SELECT management_code FROM users WHERE user_id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                throw new Error('ユーザーが見つかりません');
            }

            const managementCode = userRows[0].management_code;

            // 称号の利用可能性チェック（titleが指定された場合）
            if (updateData.title) {
                const [statsRows] = await connection.execute(
                    'SELECT available_titles FROM user_stats WHERE management_code = ?',
                    [managementCode]
                );

                if (statsRows.length > 0) {
                    const availableTitles = statsRows[0].available_titles.split(',');
                    if (!availableTitles.includes(updateData.title)) {
                        throw new Error('指定された称号は利用できません');
                    }
                }
            }

            // 更新データの準備
            const updateFields = {};
            if (updateData.title !== undefined) updateFields.title = updateData.title;
            if (updateData.alias !== undefined) updateFields.alias = updateData.alias;

            // user_statsテーブルの更新
            await this.update(
                'user_stats',
                updateFields,
                'management_code = ?',
                [managementCode]
            );

            return true;
        } catch (error) {
            console.error('称号・二つ名更新エラー:', error);
            throw error;
        }
    }
}

module.exports = UserModel; 