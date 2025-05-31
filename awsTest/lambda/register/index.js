const ResponseService = require('../../lib/services/ResponseService');
const ValidationService = require('../../lib/services/ValidationService');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

// MySQL接続設定
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

/**
 * ユーザーID重複チェック
 */
async function checkUserIdAvailability(userId) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        const [rows] = await connection.execute(
            'SELECT user_id FROM users WHERE user_id = ?',
            [userId]
        );
        
        return rows.length === 0; // 見つからなければ利用可能
        
    } finally {
        await connection.end();
    }
}

/**
 * 新規ユーザー登録
 */
async function registerUser(userData) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        await connection.beginTransaction();
        
        // management_codeを生成（UUID形式）
        const managementCode = crypto.randomUUID();
        
        // パスワードハッシュ化
        const hashedPassword = crypto.createHash('sha256').update(userData.password).digest('hex');
        
        // ユーザー情報を挿入
        await connection.execute(`
            INSERT INTO users (
                management_code, user_id, email, password, name, nickname,
                postal_code, address, phone_number, university, birthdate,
                profile_image_url, student_id_image_url, is_student_id_editable
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
        ]);
        
        // ユーザー統計の初期データを挿入
        await connection.execute(`
            INSERT INTO user_stats (
                management_code, total_wins, total_losses, total_draws,
                current_win_streak, max_win_streak, hand_stats_rock,
                hand_stats_scissors, hand_stats_paper, favorite_hand,
                recent_hand_results_str, daily_wins, daily_losses,
                daily_draws, title, available_titles, alias,
                show_title, show_alias, user_rank
            ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, 0, '初心者', '初心者', '', true, true, 'bronze')
        `, [managementCode]);
        
        await connection.commit();
        
        return {
            userId: userData.userId,
            nickname: userData.nickname,
            managementCode: managementCode
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

exports.handler = async (event) => {
    try {
        const ResponseService = require('../../lib/services/ResponseService');
        
        if (event.httpMethod === 'GET' && event.path.includes('/check-userid')) {
            // ユーザーID重複チェック処理
            const { userId } = event.queryStringParameters || {};
            
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }
            
            // バリデーション
            if (userId.length < 3 || userId.length > 20) {
                return ResponseService.validationError("ユーザーIDは3文字以上20文字以下である必要があります");
            }
            
            const isAvailable = await checkUserIdAvailability(userId);
            
            const responseData = {
                success: true,
                available: isAvailable,
                message: isAvailable ? "利用可能です" : "既に使用されています"
            };
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(responseData)
            };
            
        } else if (event.httpMethod === 'POST') {
            // ユーザー登録処理
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (err) {
                return ResponseService.validationError("Invalid JSON format");
            }
            
            // 必須フィールドのバリデーション
            const requiredFields = ['userId', 'email', 'password', 'name', 'nickname'];
            const missingFields = requiredFields.filter(field => !body[field]);
            
            if (missingFields.length > 0) {
                return ResponseService.validationError(`必須フィールドが不足しています: ${missingFields.join(', ')}`);
            }
            
            // ユーザーID重複チェック
            const isUserIdAvailable = await checkUserIdAvailability(body.userId);
            if (!isUserIdAvailable) {
                return ResponseService.validationError("ユーザーIDが既に存在します");
            }
            
            // メールアドレス形式チェック
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return ResponseService.validationError("メールアドレスの形式が正しくありません");
            }
            
            // パスワード長チェック
            if (body.password.length < 6) {
                return ResponseService.validationError("パスワードは6文字以上である必要があります");
            }
            
            // ユーザー登録実行
            const registeredUser = await registerUser(body);
            
            const responseData = {
                success: true,
                message: "登録が完了しました",
                user: {
                    userId: registeredUser.userId,
                    nickname: registeredUser.nickname
                }
            };
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(responseData)
            };
            
        } else {
            return ResponseService.validationError("サポートされていないHTTPメソッドです");
        }

    } catch (error) {
        console.error('Register API処理エラー:', error);
        return ResponseService.error("登録処理中にエラーが発生しました");
    }
}; 