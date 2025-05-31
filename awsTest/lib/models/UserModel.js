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
     * ユーザーとステータス情報の統合取得
     */
    async getUserWithStats(userId) {
        const query = `
            SELECT 
                u.*,
                us.title,
                us.alias,
                us.win_count,
                us.lose_count,
                us.draw_count,
                us.total_matches,
                us.win_rate,
                us.ranking_points
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.user_id = ?
        `;
        return await this.findOne(query, [userId]);
    }
}

module.exports = UserModel; 