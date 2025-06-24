const ResponseService = require('../../lib/services/ResponseService');
const ValidationService = require('../../lib/services/ValidationService');
const UserModel = require('../../lib/models/UserModel');
const ImageStorage = require('../../utils/fileStorage');
const crypto = require('crypto');

const userModel = new UserModel();
const imageStorage = new ImageStorage();

/**
 * ユーザーID重複チェック
 */
async function checkUserIdAvailability(userId) {
    const connection = await pool.getConnection();
    console.log(`🔍 Checking userId availability for: ${userId}`);
    
    try {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE user_id = ?',
            [userId]
        );
        
        console.log('🔍 Database query result:', rows[0]);
        return rows[0].count === 0; // 見つからなければ利用可能
        
    } catch (error) {
        console.error('❌ Database error during userId check:', error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * 新規ユーザー登録
 */
async function registerUser(userData) {
    const connection = await pool.getConnection();
    console.log('📝 Registering new user with data:', { ...userData, password: '[REDACTED]' });
    
    try {
        await connection.beginTransaction();
        
        // management_codeを生成（UUID形式）
        const managementCode = crypto.randomUUID();
        
        // パスワードハッシュ化
        const hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');
        
        // ユーザー情報を挿入
        const userInsertQuery = `
            INSERT INTO users (
                management_code, user_id, email, password, name, nickname,
                postal_code, address, phone_number, university, birthdate,
                profile_image_url, student_id_image_url, is_student_id_editable
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            false // is_student_id_editable
        ];

        console.log('📝 Executing user insert query:', {
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

        console.log('📝 Executing stats insert query:', {
            query: statsInsertQuery,
            values: [managementCode]
        });

        await connection.execute(statsInsertQuery, [managementCode]);
        
        await connection.commit();
        console.log('✅ User registration completed successfully');

        // 登録したユーザーの情報を取得
        const [userRows] = await connection.execute(
            `SELECT 
                u.user_id, 
                u.nickname,
                u.profile_image_url,
                us.title,
                us.alias
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.management_code = ?`,
            [managementCode]
        );
        
        return userRows[0];
        
    } catch (error) {
        console.error('❌ Error during user registration:', error);
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * マルチパートデータの解析
 */
async function parseMultipartData(req) {
    try {
        const formData = await imageStorage.parseMultipartForm(req);
        const fields = formData.fields;
        const files = formData.files;

        // ファイルのアップロード処理
        let profileImageUrl = null;
        let studentIdImageUrl = null;

        if (files.profileImage) {
            const result = await imageStorage.uploadImage(fields.userId, files.profileImage, 'profile');
            profileImageUrl = result.url;
        }
        if (files.studentIdImage) {
            const result = await imageStorage.uploadImage(fields.userId, files.studentIdImage, 'studentId');
            studentIdImageUrl = result.url;
        }

        return {
            ...fields,
            profileImageUrl,
            studentIdImageUrl
        };
    } catch (error) {
        console.error('Error parsing multipart data:', error);
        throw error;
    }
}

/**
 * Express用ハンドラー
 */
exports.handler = async (req, res) => {
    try {
        console.log('📥 Received request:', {
            method: req.method,
            path: req.path,
            query: req.query,
            headers: req.headers,
            body: req.body
        });

        if (req.method === 'GET' && req.path.includes('/check-userid')) {
            // ユーザーID重複チェック処理
            const { userId } = req.query;
            
            if (!userId) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'ユーザーIDは必須です',
                            details: null
                        }
                    })
                };
            }
            
            const isAvailable = await checkUserIdAvailability(userId);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    data: {
                        isAvailable
                    }
                })
            };
        }

        if (req.method === 'POST' && req.path === '/register') {
            // 新規ユーザー登録処理
            console.log('📝 Processing registration request with body:', req.body);
            const userData = req.body.data || req.body;
            
            // バリデーション
            const validationResult = ValidationService.validateUserRegistration(userData);
            if (!validationResult.isValid) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: '入力データが不正です',
                            details: validationResult.errors
                        }
                    })
                };
            }

            // ユーザーID重複チェック
            const isUserIdAvailable = await checkUserIdAvailability(userData.userId);
            if (!isUserIdAvailable) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        error: {
                            code: 'DUPLICATE_USER_ID',
                            message: 'このユーザーIDは既に使用されています',
                            details: null
                        }
                    })
                };
            }

            // ユーザー登録
            const user = await registerUser(userData);
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    data: {
                        user
                    }
                })
            };
        }

        // 未対応のメソッド
        return {
            statusCode: 405,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: '未対応のメソッドです',
                    details: null
                }
            })
        };

    } catch (error) {
        console.error('❌ Error in handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'サーバーエラーが発生しました',
                    details: error.stack
                }
            })
        };
    }
}; 