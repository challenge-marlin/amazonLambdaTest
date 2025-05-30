const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
    console.log("Login Event Data:", JSON.stringify(event, null, 2));

    try {
        // リクエストボディの解析
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
                },
                body: JSON.stringify({ 
                    success: false, 
                    message: "Invalid JSON format" 
                })
            };
        }

        const { userId, password } = body;
        
        // 必須パラメータチェック
        if (!userId || !password) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
                },
                body: JSON.stringify({ 
                    success: false, 
                    message: "ユーザーIDとパスワードは必須です" 
                })
            };
        }

        console.log("ユーザー認証処理開始 - UserId:", userId);

        // MySQL接続設定（MySQL2対応版）
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            timezone: '+09:00',
            charset: 'utf8mb4',
            ssl: false,
            // MySQL2で有効なオプションのみ
            supportBigNumbers: true,
            bigNumberStrings: true,
            dateStrings: false
        };

        console.log("DB接続設定:", {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database
        });

        // データベース接続
        const connection = await mysql.createConnection(dbConfig);

        try {
            // UTF-8エンコーディングを明示的に設定
            await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
            await connection.execute("SET CHARACTER SET utf8mb4");
            await connection.execute("SET character_set_connection=utf8mb4");
            
            // ユーザー認証（パスワードハッシュ化は後で実装、今はプレーンテキスト）
            const [userRows] = await connection.execute(
                `SELECT 
                    u.user_id,
                    u.nickname,
                    u.name,
                    u.email,
                    u.profile_image_url,
                    us.title,
                    us.alias
                FROM users u
                LEFT JOIN user_stats us ON u.management_code = us.management_code
                WHERE u.user_id = ? AND u.password = ?`,
                [userId, password]
            );

            if (userRows.length === 0) {
                return {
                    statusCode: 401,
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
                    },
                    body: JSON.stringify({
                        success: false,
                        message: "ユーザーIDまたはパスワードが正しくありません"
                    })
                };
            }

            const user = userRows[0];
            console.log("ユーザー認証成功:", user.user_id);

            // 仕様書に合わせたレスポンス
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
                },
                body: JSON.stringify({
                    success: true,
                    user: {
                        user_id: user.user_id,
                        nickname: user.nickname || '',
                        title: user.title || '',
                        alias: user.alias || '',
                        profile_image_url: user.profile_image_url || ''
                    }
                })
            };

        } finally {
            await connection.end();
        }

    } catch (error) {
        console.error("ログイン処理エラー:", error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
            },
            body: JSON.stringify({
                success: false,
                message: "ログイン処理中にエラーが発生しました"
            })
        };
    }
}; 