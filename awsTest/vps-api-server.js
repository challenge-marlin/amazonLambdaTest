const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Lambda関数をインポート
let testHandler, handHandler, judgeHandler, loginHandler, userHandler, userStatsHandler, registerHandler;

try {
    testHandler = require('./lambda/test/index.js');
    handHandler = require('./lambda/hand/index.js');
    judgeHandler = require('./lambda/judge/index.js');
    loginHandler = require('./lambda/login/index.js');
    userHandler = require('./lambda/user/index.js');
    // userStatsHandler = require('./lambda/user-stats/index.js');
    // registerHandler = require('./lambda/register/index.js');
    console.log('✅ Lambda functions loaded successfully');
} catch (error) {
    console.error('❌ Lambda function import error:', error.message);
}

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
    app.post('/hand', (req, res) => wrapLambda(handHandler, req, res));
    console.log('✋ Hand endpoints registered');
}

if (judgeHandler) {
    app.post('/judge', (req, res) => wrapLambda(judgeHandler, req, res));
    console.log('⚖️  Judge endpoints registered');
}

if (loginHandler) {
    app.post('/login', (req, res) => wrapLambda(loginHandler, req, res));
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
    app.post('/register', (req, res) => wrapLambda(registerHandler, req, res));
    console.log('📝 Register endpoints registered');
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
    console.log(`🎯 Janken API Server (VPS Mode - Async Fixed)`);
    console.log(`📡 Running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Test API: http://localhost:${PORT}/test/user`);
    console.log('🚀 ===================================');
}); 