const BaseModel = require('./BaseModel');
const crypto = require('crypto');

class UserModel extends BaseModel {
    /**
     * パスワードのハッシュ化
     */
    hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    /**
     * ユーザー認証（ログイン）
     */
    async authenticateUser(userId, password) {
        console.log('🔐 Authenticating user:', userId);
        // 開発用：一時的にパスワードのハッシュ化をスキップ
        // const hashedPassword = this.hashPassword(password);
        
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
        
        const result = await this.findOne(query, [userId, password]);
        console.log('🔐 Authentication result:', result ? 'Success' : 'Failed');
        return result;
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
     * 新規ユーザー作成（トランザクション使用）
     */
    async createUser(userData) {
        console.log('👤 Creating new user:', { ...userData, password: '[REDACTED]' });
        
        return await this.executeTransaction(async (connection) => {
            // management_codeを生成
            const managementCode = crypto.randomUUID();
            console.log('👤 Generated management code:', managementCode);

            // パスワードのハッシュ化
            const hashedPassword = this.hashPassword(userData.password);
            
            // ユーザー情報を挿入
            const userInsertQuery = `
                INSERT INTO users (
                    management_code, user_id, email, password, name, nickname,
                    postal_code, address, phone_number, university, birthdate,
                    profile_image_url, student_id_image_url, is_student_id_editable,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const userInsertValues = [
                managementCode,
                userData.userId,
                userData.email,
                hashedPassword,
                userData.name,
                userData.nickname,
                userData.postalCode || null,
                userData.address || null,
                userData.phoneNumber || null,
                userData.university || null,
                userData.birthdate || null,
                userData.profileImageUrl || null,
                userData.studentIdImageUrl || null,
                false
            ];

            console.log('👤 Executing user insert:', {
                query: userInsertQuery,
                values: userInsertValues.map(v => v === hashedPassword ? '[REDACTED]' : v)
            });

            await connection.execute(userInsertQuery, userInsertValues);
            
            // ユーザー統計の初期データを挿入
            const statsInsertQuery = `
                INSERT INTO user_stats (
                    management_code, total_wins, total_losses, total_draws,
                    current_win_streak, max_win_streak, hand_stats_rock,
                    hand_stats_scissors, hand_stats_paper, favorite_hand,
                    recent_hand_results_str, daily_wins, daily_losses,
                    daily_draws, title, available_titles, alias,
                    show_title, show_alias, user_rank
                ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, '初心者', '初心者', '', true, true, 'bronze')
            `;

            console.log('👤 Executing stats insert:', {
                query: statsInsertQuery,
                values: [managementCode]
            });

            await connection.execute(statsInsertQuery, [managementCode]);
            
            // 作成したユーザーの情報を取得
            const [userRows] = await connection.execute(`
                SELECT 
                    u.user_id,
                    u.nickname,
                    u.profile_image_url,
                    us.title,
                    us.alias
                FROM users u
                LEFT JOIN user_stats us ON u.management_code = us.management_code
                WHERE u.management_code = ?
            `, [managementCode]);

            console.log('👤 Created user data:', userRows[0]);
            return userRows[0];
        });
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