const db = require('../utils/db');
const redis = require('../utils/redisClient');

const CACHE_TTL = 3600; // 1時間

exports.getUserById = async (userId) => {
    // キャッシュから取得を試みる
    const cachedUser = await redis.get(`user:${userId}`);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    // データベースから取得
    const [rows] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );

    if (rows.length === 0) {
        return null;
    }

    const user = rows[0];
    
    // キャッシュに保存
    await redis.setex(`user:${userId}`, CACHE_TTL, JSON.stringify(user));

    return user;
};

exports.createUser = async (userData) => {
    const { name, email } = userData;
    
    const [result] = await db.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
    );

    const userId = result.insertId;
    const newUser = {
        id: userId,
        name,
        email
    };

    // キャッシュに保存
    await redis.setex(`user:${userId}`, CACHE_TTL, JSON.stringify(newUser));

    return newUser;
}; 