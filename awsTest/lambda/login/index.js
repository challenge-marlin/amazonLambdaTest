const KC = require('../../utils/godlib_database/KnexConnect.js');
const S = require('../../utils/godlib_database/SelecterUser.js');

exports.handler = async (event, context) => {
    console.log("Event Data:", JSON.stringify(event, null, 2));

    try {
        // HTTP メソッドとパスのチェック
        if (event.httpMethod !== "POST" || event.path.toLowerCase() !== "/login") {
            return {
                statusCode: 404,
                body: JSON.stringify({ success: false, message: "Invalid route or method" })
            };
        }

        // ヘッダーとリクエストボディの処理
        const headers = event.headers || {};
        console.log("Headers:", headers);

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: "Invalid JSON format" })
            };
        }

        const { userId, password } = body;
        if (!userId || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: "ユーザーIDとパスワードは必須です" })
            };
        }

        console.info("ユーザー認証処理開始");

        console.log("DB情報:", process.env.DB_HOST, process.env.DB_PASSWORD, process.env.DB_NAME, process.env.DB_USER);
        const knexConnect = new KC.KnexConnect(process);
        const selecter = new S.Selecter_User(knexConnect);

        const user = await selecter.authenticateUser(userId, password);
        console.info("ユーザー認証処理終了");

        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ success: false, message: "ユーザーIDまたはパスワードが正しくありません" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                user: {
                    user_id: user.user_id,
                    nickname: user.nickname,
                    title: user.title,
                    alias: user.alias,
                    profile_image_url: user.profile_image_url
                }
            })
        };

    } catch (error) {
        console.error("ログイン処理エラー:", error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "ログイン処理中にエラーが発生しました" })
        };
    }
}; 