const ResponseService = require('../../lib/services/ResponseService');
const mysql = require('mysql2/promise');

// MySQL接続設定
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

/**
 * ランキングデータを生成
 */
async function generateRankingWithUsername() {
    let connection;
    
    try {
        console.log('データベース接続を開始...');
        console.log('接続設定:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME
        });
        
        connection = await mysql.createConnection(dbConfig);
        console.log('データベース接続成功');
        
        // まずはシンプルなクエリでテスト
        const [testRows] = await connection.execute('SELECT COUNT(*) as user_count FROM users');
        console.log(`usersテーブル件数: ${testRows[0].user_count}`);
        
        const [statsRows] = await connection.execute('SELECT COUNT(*) as stats_count FROM user_stats');
        console.log(`user_statsテーブル件数: ${statsRows[0].stats_count}`);
        
        // ユーザー統計データからランキングを取得
        const [rows] = await connection.execute(`
            SELECT 
                u.user_id,
                u.nickname,
                COALESCE(us.total_wins, 0) as wins,
                COALESCE(us.user_rank, 'bronze') as \`rank\`,
                ROW_NUMBER() OVER (ORDER BY COALESCE(us.total_wins, 0) DESC, u.user_id ASC) as ranking_position
            FROM users u
            LEFT JOIN user_stats us ON u.management_code = us.management_code
            WHERE u.user_id IS NOT NULL
            ORDER BY COALESCE(us.total_wins, 0) DESC, u.user_id ASC
            LIMIT 200
        `);

        console.log(`ランキングクエリ結果: ${rows.length}件`);
        
        return rows.map(row => ({
            user_id: row.user_id,
            nickname: row.nickname || 'Unknown',
            ranking_position: parseInt(row.ranking_position),
            wins: parseInt(row.wins) || 0,
            rank: row.rank || 'bronze'
        }));

    } catch (error) {
        console.error('データベースクエリエラー:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

exports.handler = async (event) => {
    try {
        console.log("ランキング取得処理開始");
        console.log("環境変数:", {
            DB_HOST: process.env.DB_HOST,
            DB_USER: process.env.DB_USER,
            DB_NAME: process.env.DB_NAME
        });

        // ランキングデータの生成
        const rankings = await generateRankingWithUsername();
        
        console.log(`ランキングデータ取得完了: ${rankings.length}件`);
        
        // API仕様書に合わせたレスポンス形式
        const responseData = {
            success: true,
            rankings: rankings
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(responseData)
        };

    } catch (error) {
        console.error('ランキングデータ取得エラー:', error);
        console.error('エラーの詳細:', error.stack);
        return ResponseService.error("ランキングデータの取得中にエラーが発生しました", 500, 'RANKING_ERROR', error.message);
    }
}; 