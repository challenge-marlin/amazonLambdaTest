const express = require('express');
const cors = require('cors');

// VPS環境用の環境変数設定
process.env.DB_HOST = process.env.DB_HOST || 'awstest-mysql';
process.env.DB_USER = process.env.DB_USER || 'lambda_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'lambda_password';
process.env.DB_NAME = process.env.DB_NAME || 'jankendb';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'awstest-redis';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

console.log('🔧 VPS環境変数設定:');
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log(`   REDIS_HOST: ${process.env.REDIS_HOST}`);

const app = express();

// UTF-8エンコーディング設定を強化
app.use(express.json({ 
    limit: '10mb',
    type: 'application/json' 
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// CORSの詳細設定
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key'],
    credentials: false
}));

// UTF-8レスポンスヘッダーのミドルウェア
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

// Lambda関数を個別に読み込み（エラー時は個別にスキップ）
let testHandler, handHandler, judgeHandler, loginHandler, userHandler, userStatsHandler, registerHandler, rankingHandler;

// test関数の読み込み
try {
    testHandler = require('./lambda/test/index.js');
    console.log('✅ Test handler loaded');
} catch (error) {
    console.error('❌ Test handler error:', error.message);
}

// hand関数の読み込み
try {
    handHandler = require('./lambda/hand/index.js');
    console.log('✅ Hand handler loaded');
} catch (error) {
    console.error('❌ Hand handler error:', error.message);
}

// judge関数の読み込み
try {
    judgeHandler = require('./lambda/judge/index.js');
    console.log('✅ Judge handler loaded');
} catch (error) {
    console.error('❌ Judge handler error:', error.message);
}

// login関数の読み込み
try {
    loginHandler = require('./lambda/login/index.js');
    console.log('✅ Login handler loaded');
} catch (error) {
    console.error('❌ Login handler error:', error.message);
}

// user関数の読み込み
try {
    userHandler = require('./lambda/user/index.js');
    console.log('✅ User handler loaded');
} catch (error) {
    console.error('❌ User handler error:', error.message);
}

// user-stats関数の読み込み
try {
    userStatsHandler = require('./lambda/user-stats/index.js');
    console.log('✅ User-stats handler loaded');
} catch (error) {
    console.error('❌ User-stats handler error:', error.message);
}

// ranking関数の読み込み
try {
    rankingHandler = require('./lambda/ranking/index.js');
    console.log('✅ Ranking handler loaded');
} catch (error) {
    console.error('❌ Ranking handler error:', error.message);
}

// register関数の読み込み
try {
    registerHandler = require('./lambda/register/index.js');
    console.log('✅ Register handler loaded');
} catch (error) {
    console.error('❌ Register handler error:', error.message);
}

console.log('📦 Lambda function loading completed');

// ヘルスチェック
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: 'VPS-Express',
        version: '1.0.0'
    });
});

// 修正版Lambda関数ラッパー（async/await対応）
const wrapLambda = async (handler, req, res) => {
    const event = {
        httpMethod: req.method,
        path: req.path,  // この行を追加
        body: JSON.stringify(req.body),
        headers: req.headers,
        pathParameters: req.params,
        queryStringParameters: req.query
    };
    
    const context = {
        functionName: handler.name || 'unknown',
        requestId: `req-${Date.now()}`,
        getRemainingTimeInMillis: () => 30000
    };
    
    console.log(`📝 ${req.method} ${req.path} - Processing...`);
    
    try {
        // Lambda関数を直接呼び出し（async/await）
        const result = await handler.handler(event, context);
        
        const statusCode = result.statusCode || 200;
        let body;
        try {
            body = JSON.parse(result.body);
        } catch (e) {
            body = result.body;
        }
        
        console.log(`✅ ${req.method} ${req.path} - Status: ${statusCode}`);
        res.status(statusCode).json(body);
        
    } catch (error) {
        console.error('❌ Lambda error:', error);
        res.status(500).json({ 
            error: error.message,
            requestId: context.requestId 
        });
    }
};

// API エンドポイント
if (testHandler) {
    app.post('/test/user', (req, res) => wrapLambda(testHandler, req, res));
    app.get('/users/:userId', (req, res) => wrapLambda(testHandler, req, res));
    console.log('📋 Test endpoints registered');
}

if (handHandler) {
    app.post('/match/hand', (req, res) => wrapLambda(handHandler, req, res));
    console.log('✋ Hand endpoints registered');
}

if (judgeHandler) {
    app.post('/match/judge', (req, res) => wrapLambda(judgeHandler, req, res));
    console.log('⚖️  Judge endpoints registered');
}

if (loginHandler) {
    app.post('/UserInfo', (req, res) => wrapLambda(loginHandler, req, res));
    console.log('🔐 Login endpoints registered');
}

if (userHandler) {
    app.get('/api/user', (req, res) => wrapLambda(userHandler, req, res));
    app.put('/api/user', (req, res) => wrapLambda(userHandler, req, res));
    app.post('/api/user/profile-image', (req, res) => wrapLambda(userHandler, req, res));
    console.log('👤 User endpoints registered');
}

if (userStatsHandler) {
    app.get('/api/user-stats/:userId', (req, res) => wrapLambda(userStatsHandler, req, res));
    app.put('/api/user-stats/:userId', (req, res) => wrapLambda(userStatsHandler, req, res));
    console.log('📊 User stats endpoints registered');
}

if (registerHandler) {
    app.get('/check-userid', (req, res) => wrapLambda(registerHandler, req, res));
    app.post('/register', (req, res) => wrapLambda(registerHandler, req, res));
    console.log('📝 Register endpoints registered');
} else {
    // 一時的な実装（handlerが利用できない場合）
    app.get('/check-userid', (req, res) => {
        const { userId } = req.query;
        res.json({
            success: true,
            available: true,
            message: "利用可能です"
        });
        console.log('✅ UserID check API called (temporary implementation)');
    });

    app.post('/register', (req, res) => {
        res.json({
            success: true,
            message: "登録が完了しました",
            user: {
                userId: req.body.userId,
                nickname: req.body.nickname
            }
        });
        console.log('📝 User registration API called (temporary implementation)');
    });
}

// マッチング状態確認API追加
if (handHandler) {
    app.get('/match', (req, res) => {
        const matchEvent = {
            httpMethod: 'GET',
            path: '/match',
            queryStringParameters: req.query,
            headers: req.headers
        };
        wrapLambda(handHandler, { ...req, body: null }, res);
    });
    console.log('🎯 Match status endpoint registered');
}

// マッチング開始API追加
if (handHandler) {
    app.post('/match', (req, res) => wrapLambda(handHandler, req, res));
    console.log('🎯 Match start endpoint registered');
}

// 仕様書に合わせて手のリセットAPI追加
if (handHandler) {
    app.post('/match/reset_hands', (req, res) => wrapLambda(handHandler, req, res));
    console.log('🔄 Hand reset endpoint registered');
}

// ランキングAPI - 仕様書に合わせて実装
if (rankingHandler) {
    app.get('/ranking', (req, res) => wrapLambda(rankingHandler, req, res));
    console.log('🏆 Ranking endpoints registered');
} else {
    // 一時的な実装（handlerが利用できない場合）
    app.get('/ranking', (req, res) => {
        res.json({
            success: true,
            rankings: [
                {
                    user_id: "sample001",
                    nickname: "サンプルユーザー",
                    ranking_position: 1,
                    wins: 100,
                    rank: "master"
                }
            ]
        });
        console.log('🏆 Ranking API called (temporary implementation)');
    });
}

// 404ハンドラー
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ===================================');
    console.log(`🎯 Janken API Server (VPS Mode - API Specification Compliant)`);
    console.log(`📡 Running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Test API: http://localhost:${PORT}/test/user`);
    console.log(`🔐 Login API: http://localhost:${PORT}/UserInfo`);
    console.log(`👤 User API: http://localhost:${PORT}/api/user`);
    console.log(`📊 User Stats API: http://localhost:${PORT}/api/user-stats/:userId`);
    console.log(`🎯 Match API: http://localhost:${PORT}/match`);
    console.log(`✋ Hand API: http://localhost:${PORT}/match/hand`);
    console.log(`⚖️  Judge API: http://localhost:${PORT}/match/judge`);
    console.log(`🔄 Reset API: http://localhost:${PORT}/match/reset_hands`);
    console.log(`🏆 Ranking API: http://localhost:${PORT}/ranking`);
    console.log(`📝 Register API: http://localhost:${PORT}/register`);
    console.log(`✅ Check UserID API: http://localhost:${PORT}/check-userid`);
    console.log('🚀 ===================================');
}); 