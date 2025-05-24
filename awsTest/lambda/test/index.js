const Redis = require('ioredis');
const mysql = require('mysql2/promise');

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

exports.handler = async (event) => {
  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const userId = body.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'userId is required'
        })
      };
    }

    // Check Redis connection
    let redisStatus = 'unavailable';
    try {
      await redis.ping();
      redisStatus = 'available';
    } catch (error) {
      console.error('Redis connection error:', error);
    }

    // Connect to MySQL
    const connection = await mysql.createConnection(dbConfig);

    // Get user information
    const [userRows] = await connection.execute(
      `SELECT 
        u.*, 
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
        us.user_rank
      FROM users u
      LEFT JOIN user_stats us ON u.user_id = us.user_id
      WHERE u.user_id = ?`,
      [userId]
    );

    await connection.end();

    if (userRows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'User not found'
        })
      };
    }

    // Remove sensitive information
    const userInfo = userRows[0];
    delete userInfo.password;

    return {
      statusCode: 200,
      body: JSON.stringify({
        redisStatus,
        userInfo
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
}; 