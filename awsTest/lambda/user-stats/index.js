const mysql = require('mysql2/promise');
const Redis = require('ioredis');

// Redis client initialization
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD || '',
  retryStrategy: (times) => {
    return Math.min(times * 100, 3000);
  }
});

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Helper function to create response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE'
  },
  body: JSON.stringify(body)
});

// Helper function to create error response
const createErrorResponse = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    details
  }
});

// Helper function to create success response
const createSuccessResponse = (data) => ({
  success: true,
  data
});

// GET /api/user-stats/{userId} - ユーザーステータス取得
const getUserStats = async (userId) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // まずユーザーの存在確認
    const [userRows] = await connection.execute(
      'SELECT management_code FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        '指定されたユーザーが見つかりません'
      ));
    }

    const managementCode = userRows[0].management_code;

    // ユーザーステータスを取得（存在しない場合は作成）
    let [statsRows] = await connection.execute(
      `SELECT 
        us.user_id as userId,
        us.show_title as showTitle,
        us.show_alias as showAlias,
        us.total_wins as winCount,
        us.total_losses as loseCount,
        us.total_draws as drawCount,
        (us.total_wins + us.total_losses + us.total_draws) as totalMatches,
        us.daily_wins as dailyWins,
        us.user_rank as dailyRank,
        us.daily_ranking as dailyRanking,
        us.recent_hand_results_str as recentHandResultsStr,
        us.title,
        us.available_titles as availableTitles,
        us.alias,
        us.created_at as createdAt,
        us.updated_at as updatedAt
      FROM user_stats us 
      WHERE us.management_code = ?`,
      [managementCode]
    );

    // ユーザーステータスが存在しない場合は作成
    if (statsRows.length === 0) {
      await connection.execute(
        `INSERT INTO user_stats (
          management_code, user_id, show_title, show_alias,
          total_wins, total_losses, total_draws, daily_wins,
          user_rank, daily_ranking, recent_hand_results_str,
          title, available_titles, alias, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [managementCode, userId, true, true, 0, 0, 0, 0, 'ブロンズ', 0, '', '初心者', '初心者', '']
      );

      // 作成したステータスを再取得
      [statsRows] = await connection.execute(
        `SELECT 
          us.user_id as userId,
          us.show_title as showTitle,
          us.show_alias as showAlias,
          us.total_wins as winCount,
          us.total_losses as loseCount,
          us.total_draws as drawCount,
          (us.total_wins + us.total_losses + us.total_draws) as totalMatches,
          us.daily_wins as dailyWins,
          us.user_rank as dailyRank,
          us.daily_ranking as dailyRanking,
          us.recent_hand_results_str as recentHandResultsStr,
          us.title,
          us.available_titles as availableTitles,
          us.alias,
          us.created_at as createdAt,
          us.updated_at as updatedAt
        FROM user_stats us 
        WHERE us.management_code = ?`,
        [managementCode]
      );
    }

    return createResponse(200, createSuccessResponse({
      stats: statsRows[0]
    }));

  } finally {
    await connection.end();
  }
};

// PUT /api/user-stats/{userId} - ユーザーステータス更新
const updateUserStats = async (userId, updateData) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // ユーザーの存在確認
    const [userRows] = await connection.execute(
      'SELECT management_code FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        '指定されたユーザーが見つかりません'
      ));
    }

    const managementCode = userRows[0].management_code;

    // バリデーション
    const allowedFields = ['title', 'alias'];
    const updateFields = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return createResponse(400, createErrorResponse(
        'INVALID_REQUEST',
        '更新するフィールドが指定されていません'
      ));
    }

    // ユーザーステータスの存在確認（存在しない場合は作成）
    let [existingStats] = await connection.execute(
      'SELECT user_id FROM user_stats WHERE management_code = ?',
      [managementCode]
    );

    if (existingStats.length === 0) {
      // ユーザーステータスが存在しない場合は作成
      await connection.execute(
        `INSERT INTO user_stats (
          management_code, user_id, show_title, show_alias,
          total_wins, total_losses, total_draws, daily_wins,
          user_rank, daily_ranking, recent_hand_results_str,
          title, available_titles, alias, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [managementCode, userId, true, true, 0, 0, 0, 0, 'ブロンズ', 0, '', 
         updateFields.title || '初心者', '初心者', updateFields.alias || '']
      );
    } else {
      // 更新クエリの構築
      const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(updateFields), managementCode];
      
      await connection.execute(
        `UPDATE user_stats SET ${setClause}, updated_at = NOW() WHERE management_code = ?`,
        values
      );
    }

    // 更新後のユーザーステータスを取得
    const [updatedStats] = await connection.execute(
      `SELECT 
        user_id as userId,
        title,
        alias,
        updated_at as updatedAt
      FROM user_stats 
      WHERE management_code = ?`,
      [managementCode]
    );

    return createResponse(200, createSuccessResponse({
      stats: updatedStats[0]
    }));

  } finally {
    await connection.end();
  }
};

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path;
    
    // ユーザーIDの取得（パスパラメータから）
    let userId;
    if (event.pathParameters && event.pathParameters.userId) {
      userId = event.pathParameters.userId;
    } else {
      return createResponse(400, createErrorResponse(
        'INVALID_REQUEST',
        'ユーザーIDが指定されていません'
      ));
    }

    // リクエストボディの解析
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        return createResponse(400, createErrorResponse(
          'INVALID_REQUEST',
          'リクエストボディが不正です'
        ));
      }
    }

    // ルーティング
    if (method === 'GET' && path.startsWith('/api/user-stats/')) {
      return await getUserStats(userId);
    } else if (method === 'PUT' && path.startsWith('/api/user-stats/')) {
      return await updateUserStats(userId, requestBody);
    } else {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        'エンドポイントが見つかりません'
      ));
    }

  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, createErrorResponse(
      'INTERNAL_ERROR',
      'サーバーエラーが発生しました',
      error.message
    ));
  }
}; 