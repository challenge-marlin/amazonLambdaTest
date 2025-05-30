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

// GET /api/user - ユーザープロフィール取得
const getUserProfile = async (userId) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // UTF-8エンコーディングを明示的に設定
    await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("SET CHARACTER SET utf8mb4");
    await connection.execute("SET character_set_connection=utf8mb4");
    
    const [userRows] = await connection.execute(
      `SELECT 
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
      WHERE u.user_id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        '指定されたユーザーが見つかりません'
      ));
    }

    return createResponse(200, createSuccessResponse({
      user: userRows[0]
    }));

  } finally {
    await connection.end();
  }
};

// PUT /api/user - ユーザー情報更新
const updateUserProfile = async (userId, updateData) => {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // UTF-8エンコーディングを明示的に設定
    await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("SET CHARACTER SET utf8mb4");
    await connection.execute("SET character_set_connection=utf8mb4");
    
    // バリデーション
    const allowedFields = ['name', 'nickname', 'email', 'university', 'postalCode', 'address', 'phoneNumber'];
    const updateFields = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // フィールド名をスネークケースに変換
        const dbField = field === 'postalCode' ? 'postal_code' : 
                       field === 'phoneNumber' ? 'phone_number' : field;
        updateFields[dbField] = updateData[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return createResponse(400, createErrorResponse(
        'INVALID_REQUEST',
        '更新するフィールドが指定されていません'
      ));
    }

    // ユーザーの存在確認
    const [existingUser] = await connection.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        '指定されたユーザーが見つかりません'
      ));
    }

    // 更新クエリの構築
    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    const values = [...Object.values(updateFields), userId];
    
    await connection.execute(
      `UPDATE users SET ${setClause}, updated_at = NOW() WHERE user_id = ?`,
      values
    );

    // 更新後のユーザー情報を取得
    const [updatedUser] = await connection.execute(
      `SELECT 
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
        u.updated_at as updatedAt
      FROM users u
      LEFT JOIN user_stats us ON u.management_code = us.management_code
      WHERE u.user_id = ?`,
      [userId]
    );

    return createResponse(200, createSuccessResponse({
      user: updatedUser[0]
    }));

  } finally {
    await connection.end();
  }
};

// POST /api/user/profile-image - プロフィール画像アップロード
const uploadProfileImage = async (userId, fileData) => {
  // 実際の実装では、S3にアップロードする処理を行う
  // ここでは簡易的にダミーURLを返す
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // UTF-8エンコーディングを明示的に設定
    await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.execute("SET CHARACTER SET utf8mb4");
    await connection.execute("SET character_set_connection=utf8mb4");
    
    // ファイルサイズチェック（5MB制限）
    if (fileData && fileData.length > 5 * 1024 * 1024) {
      return createResponse(400, createErrorResponse(
        'INVALID_REQUEST',
        'ファイルサイズが大きすぎます'
      ));
    }

    // ユーザーの存在確認
    const [existingUser] = await connection.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return createResponse(404, createErrorResponse(
        'NOT_FOUND',
        '指定されたユーザーが見つかりません'
      ));
    }

    // ダミーのプロフィール画像URL（実際の実装ではS3のURLを使用）
    const profileImageUrl = `https://example.com/profile-images/${userId}-${Date.now()}.jpg`;

    // データベースを更新
    await connection.execute(
      'UPDATE users SET profile_image_url = ?, updated_at = NOW() WHERE user_id = ?',
      [profileImageUrl, userId]
    );

    return createResponse(200, createSuccessResponse({
      profileImageUrl
    }));

  } finally {
    await connection.end();
  }
};

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;
    const path = event.path;
    
    // ユーザーIDの取得（クエリパラメータまたはパスパラメータから）
    let userId;
    if (method === 'GET' && event.queryStringParameters && event.queryStringParameters.userId) {
      userId = event.queryStringParameters.userId;
    } else if (event.pathParameters && event.pathParameters.userId) {
      userId = event.pathParameters.userId;
    } else {
      // デフォルトユーザー（テスト用）
      userId = 'user001';
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
    if (method === 'GET' && path === '/api/user') {
      return await getUserProfile(userId);
    } else if (method === 'PUT' && path === '/api/user') {
      return await updateUserProfile(userId, requestBody);
    } else if (method === 'POST' && path === '/api/user/profile-image') {
      return await uploadProfileImage(userId, event.body);
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