const UserStatsController = require('../../../../lib/controllers/UserStatsController');

exports.handler = async (event) => {
    const userStatsController = new UserStatsController();
    
    try {
        // パスパラメータからユーザーIDを取得
        const userId = event.pathParameters?.userId;
        
        // リクエストボディをパース
        const body = JSON.parse(event.body || '{}');
        const { showTitle, showAlias } = body;

        // 表示設定を更新
        const result = await userStatsController.updateDisplaySettings(userId, { showTitle, showAlias });

        return {
            statusCode: result.success ? 200 : result.error?.code || 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Error in display settings update:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: {
                    message: 'Internal server error',
                    details: error.message
                }
            })
        };
    }
}; 