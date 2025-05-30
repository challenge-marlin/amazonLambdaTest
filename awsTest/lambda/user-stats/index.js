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

// MySQL connection configuration（MySQL2対応版）
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  ssl: false,
  // MySQL2で有効なオプションのみ
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false
};

// Helper function to create response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
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
    // UTF-8エンコーディングを明示的に設定
    await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("SET CHARACTER SET utf8mb4");
    await connection.execute("SET character_set_connection=utf8mb4");
    
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
        us.daily_losses as loseCount,
        us.daily_draws as drawCount,
        (us.total_wins + us.daily_losses + us.daily_draws) as totalMatches,
        us.daily_wins as dailyWins,
        us.user_rank as dailyRank,
        0 as dailyRanking,
        us.recent_hand_results_str as recentHandResultsStr,
        us.title,
        us.available_titles as availableTitles,
        us.alias
      FROM user_stats us 
      WHERE us.management_code = ?`,
      [managementCode]
    );

    // ユーザーステータスが存在しない場合は作成
    if (statsRows.length === 0) {
      await connection.execute(
        `INSERT INTO user_stats (
          management_code, user_id, show_title, show_alias,
          total_wins, daily_wins, daily_losses, daily_draws,
          user_rank, recent_hand_results_str,
          title, available_titles, alias, last_reset_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [managementCode, userId, true, true, 0, 0, 0, 0, 'ブロンズ', '', '初心者', '初心者', '']
      );

      // 作成したステータスを再取得
      [statsRows] = await connection.execute(
        `SELECT 
          us.user_id as userId,
          us.show_title as showTitle,
          us.show_alias as showAlias,
          us.total_wins as winCount,
          us.daily_losses as loseCount,
          us.daily_draws as drawCount,
          (us.total_wins + us.daily_losses + us.daily_draws) as totalMatches,
          us.daily_wins as dailyWins,
          us.user_rank as dailyRank,
          0 as dailyRanking,
          us.recent_hand_results_str as recentHandResultsStr,
          us.title,
          us.available_titles as availableTitles,
          us.alias
        FROM user_stats us 
        WHERE us.management_code = ?`,
        [managementCode]
      );
    }

    return createResponse(200, createSuccessResponse({
      stats: statsRows[0]
    }));

  } catch (error) {
    console.error('getUserStats Error:', error);
    return createResponse(500, createErrorResponse(
      'INTERNAL_ERROR',
      'ユーザーステータス取得中にエラーが発生しました',
      error.message
    ));
  } finally {
    await connection.end();
  }
};

// PUT /api/user-stats/{userId} - ユーザーステータス更新
const updateUserStats = async (userId, updateData) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // UTF-8エンコーディングを明示的に設定
    await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("SET CHARACTER SET utf8mb4");
    await connection.execute("SET character_set_connection=utf8mb4");
    
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
    const allowedFields = ['title', 'alias', 'show_title', 'show_alias'];
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
          total_wins, daily_wins, daily_losses, daily_draws,
          user_rank, recent_hand_results_str,
          title, available_titles, alias, last_reset_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [managementCode, userId, 
         updateFields.show_title !== undefined ? updateFields.show_title : true, 
         updateFields.show_alias !== undefined ? updateFields.show_alias : true, 
         0, 0, 0, 0, 'ブロンズ', '', 
         updateFields.title || '初心者', '初心者', updateFields.alias || '']
      );
    } else {
      // 更新クエリの構築
      const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(updateFields), managementCode];
      
      await connection.execute(
        `UPDATE user_stats SET ${setClause} WHERE management_code = ?`,
        values
      );
    }

    // 更新後のユーザーステータスを取得
    const [updatedStats] = await connection.execute(
      `SELECT 
        user_id as userId,
        title,
        alias,
        show_title as showTitle,
        show_alias as showAlias
      FROM user_stats 
      WHERE management_code = ?`,
      [managementCode]
    );

    return createResponse(200, createSuccessResponse({
      stats: updatedStats[0]
    }));

  } catch (error) {
    console.error('updateUserStats Error:', error);
    return createResponse(500, createErrorResponse(
      'INTERNAL_ERROR',
      'ユーザーステータス更新中にエラーが発生しました',
      error.message
    ));
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
    } else if (path.includes('/api/user-stats/')) {
      // パスから直接ユーザーIDを抽出
      const pathParts = path.split('/');
      const userStatsIndex = pathParts.findIndex(part => part === 'user-stats');
      if (userStatsIndex !== -1 && pathParts[userStatsIndex + 1]) {
        userId = pathParts[userStatsIndex + 1];
      }
    }
    
    if (!userId) {
      return createResponse(400, createErrorResponse(
        'INVALID_REQUEST',
        'ユーザーIDが指定されていません'
      ));
    }

    // リクエストボディの解析
    let requestBody = {};
    if (event.body && event.body.trim() !== '') {
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
    if (method === 'GET' && path.includes('/api/user-stats/')) {
      return await getUserStats(userId);
    } else if (method === 'PUT' && path.includes('/api/user-stats/')) {
      return await updateUserStats(userId, requestBody);
    } else {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        'エンドポイントが見つかりません'
      ));
    }

  } catch (error) {
    console.error('Handler Error:', error);
    return createResponse(500, createErrorResponse(
      'INTERNAL_ERROR',
      'サーバーエラーが発生しました',
      error.message
    ));
  }
}; 