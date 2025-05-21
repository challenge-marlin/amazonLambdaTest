const redis = require('../utils/redisClient');

const SESSION_TTL = 86400; // 24時間

exports.createSession = async (userId, sessionData) => {
    const sessionId = `session:${Date.now()}:${userId}`;
    await redis.setex(sessionId, SESSION_TTL, JSON.stringify(sessionData));
    return sessionId;
};

exports.getSession = async (sessionId) => {
    const sessionData = await redis.get(sessionId);
    return sessionData ? JSON.parse(sessionData) : null;
};

exports.deleteSession = async (sessionId) => {
    await redis.del(sessionId);
}; 