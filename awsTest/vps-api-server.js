const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Minio = require('minio');

// MinIOクライアントの初期化
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'awstest-minio',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// バケットの存在確認と作成
const ensureBucket = async (bucketName) => {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
            await minioClient.makeBucket(bucketName, 'us-east-1');
            console.log(`✅ Bucket "${bucketName}" created successfully`);
        }
    } catch (error) {
        console.error(`❌ Error ensuring bucket "${bucketName}":`, error);
    }
};

// アプリケーション起動時にバケットを確認
ensureBucket('temporary-files');

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

// Multerの設定（画像アップロード用）
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB制限
    },
    fileFilter: (req, file, cb) => {
        // 画像ファイルのみを許可
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('画像ファイルのみアップロード可能です'), false);
        }
    }
});

// Lambda関数を個別に読み込み（エラー時は個別にスキップ）
let handHandler, judgeHandler, loginHandler, registerHandler, rankingHandler, lobbyUserStatsHandler, titleAliasHandler, settingsUserProfileHandler, profileImageHandler, userStatsDisplayHandler, studentIdImageHandler, titleAliasSettingsHandler, imageDeleteHandler;

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

// register関数の読み込み
try {
    registerHandler = require('./lambda/register/index.js');
    console.log('✅ Register handler loaded');
} catch (error) {
    console.error('❌ Register handler error:', error.message);
}

// ranking関数の読み込み
try {
    rankingHandler = require('./lambda/ranking/index.js');
    console.log('✅ Ranking handler loaded');
} catch (error) {
    console.error('❌ Ranking handler error:', error.message);
}

// lobbyUserStats関数の読み込み
try {
    lobbyUserStatsHandler = require('./lambda/lobby/user-stats/index.js');
    console.log('✅ Lobby User-stats handler loaded');
} catch (error) {
    console.error('❌ Lobby User-stats handler error:', error.message);
}

// titleAlias関数の読み込み
try {
    titleAliasHandler = require('./lambda/lobby/user-stats/title-alias/index.js');
    console.log('✅ Title Alias handler loaded');
} catch (error) {
    console.error('❌ Title Alias handler error:', error.message);
}

// settingsUserProfile関数の読み込み
try {
    settingsUserProfileHandler = require('./lambda/settings/user-profile/index.js');
    console.log('✅ Settings User Profile handler loaded');
} catch (error) {
    console.error('❌ Settings User Profile handler error:', error.message);
}

// profileImage関数の読み込み
try {
    profileImageHandler = require('./lambda/settings/user-profile/image/index.js');
    console.log('✅ Profile Image handler loaded');
} catch (error) {
    console.error('❌ Profile Image handler error:', error.message);
}

// userStatsDisplay関数の読み込み
try {
    userStatsDisplayHandler = require('./lambda/lobby/user-stats/display/index.js');
    console.log('✅ User Stats Display handler loaded');
} catch (error) {
    console.error('❌ User Stats Display handler error:', error.message);
}

// studentIdImage関数の読み込み
try {
    studentIdImageHandler = require('./lambda/settings/user-profile/student-id-image/index.js');
    console.log('✅ Student ID Image handler loaded');
} catch (error) {
    console.error('❌ Student ID Image handler error:', error.message);
}

// titleAliasSettings関数の読み込み
try {
    titleAliasSettingsHandler = require('./lambda/settings/user-profile/title-alias/index.js');
    console.log('✅ Title Alias Settings handler loaded');
} catch (error) {
    console.error('❌ Title Alias Settings handler error:', error.message);
}

// imageDelete関数の読み込み
try {
    imageDeleteHandler = require('./lambda/settings/user-profile/image/delete/index.js');
    console.log('✅ Image Delete handler loaded');
} catch (error) {
    console.error('❌ Image Delete handler error:', error.message);
}

console.log('📦 Lambda function loading completed');

// =============================================
// 画面単位API分離原則に基づくエンドポイント設定
// =============================================
// 各画面は専用のAPIセットを使用し、他画面のAPIに依存しません：
// - 認証API ← ログイン画面専用
// - 登録API ← 登録画面専用  
// - ロビー画面API ← ロビー画面専用
// - バトル画面API ← バトル画面専用
// - ランキング画面API ← ランキング画面専用
// - 設定画面API ← 設定画面専用

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
        path: req.path,
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
        if (typeof handler !== 'function') {
            throw new Error('handler is not a function');
        }

        // Lambda関数を直接呼び出し（async/await）
        const result = await handler(event, context);
        
        const statusCode = result.statusCode || 200;
        let body;
        try {
            body = JSON.parse(result.body);
            // 文字エンコーディング問題対策
            if (typeof body === 'object' && body !== null) {
                body = JSON.parse(JSON.stringify(body).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, ''));
            }
        } catch (e) {
            body = result.body;
        }

        // レスポンス形式の標準化
        const response = {
            success: statusCode >= 200 && statusCode < 300,
            data: body.data || body, // 既存のdataプロパティがある場合はそれを使用、なければbody全体を使用
            requestId: context.requestId
        };
        
        console.log(`✅ ${req.method} ${req.path} - Status: ${statusCode}`);
        res.status(statusCode).json(response);
        
    } catch (error) {
        console.error('❌ Lambda error:', error);
        const errorResponse = {
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error',
                details: error.details || error.stack
            },
            requestId: context.requestId
        };
        res.status(500).json(errorResponse);
    }
};

// =============================================
// APIエンドポイント（画面単位分離）
// =============================================

// バトル画面API（バトル画面専用）
if (handHandler) {
    app.get('/match', (req, res) => wrapLambda(handHandler.handler, req, res));
    app.post('/match', (req, res) => wrapLambda(handHandler.handler, req, res));
    app.post('/match/quit', (req, res) => wrapLambda(handHandler.handler, req, res));
    app.post('/match/ready', (req, res) => wrapLambda(handHandler.handler, req, res));
    app.post('/match/reset_hands', (req, res) => wrapLambda(handHandler.handler, req, res));
    console.log('⚔️ Battle screen API endpoints registered');
}

// バトル画面API（結果判定）
if (judgeHandler) {
    app.post('/match/judge', (req, res) => wrapLambda(judgeHandler.handler, req, res));
    console.log('⚖️ Battle screen judge API registered');
}

// 認証API（ログイン画面専用）
if (loginHandler) {
    app.post('/login', (req, res) => wrapLambda(loginHandler.handler, req, res));
    app.post('/UserInfo', (req, res) => wrapLambda(loginHandler.handler, req, res));
    console.log('🔐 Authentication API endpoints registered');
}

// 登録API（登録画面専用）
if (registerHandler) {
    app.get('/check-userid', (req, res) => wrapLambda(registerHandler.handler, req, res));
    app.post('/register', (req, res) => wrapLambda(registerHandler.handler, req, res));
    console.log('📝 Registration API endpoints registered');
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

// ランキング画面API（ランキング画面専用）
if (rankingHandler) {
    app.get('/ranking', (req, res) => wrapLambda(rankingHandler.handler, req, res));
    console.log('🏆 Ranking screen API endpoints registered');
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

// ロビー画面API（ロビー画面専用）
app.get('/api/lobby/user-stats/:userId', (req, res) => wrapLambda(lobbyUserStatsHandler.handler, req, res));
app.put('/api/lobby/user-stats/:userId/title-alias', (req, res) => wrapLambda(titleAliasHandler.handler, req, res));
app.put('/api/lobby/user-stats/:userId/display', async (req, res) => {
    await wrapLambda(userStatsDisplayHandler.handler, req, res);
});
console.log('🏠 Lobby screen API endpoints registered');

// 設定画面API（設定画面専用）
app.get('/api/settings/user-profile/:userId', (req, res) => wrapLambda(settingsUserProfileHandler.handler, req, res));
app.put('/api/settings/user-profile/:userId', (req, res) => wrapLambda(settingsUserProfileHandler.handler, req, res));
app.post('/api/settings/user-profile/:userId/image', upload.single('image'), async (req, res) => {
    try {
        // multerで処理されたファイル情報をeventオブジェクトに追加
        const event = {
            httpMethod: req.method,
            path: req.path,
            headers: req.headers,
            pathParameters: req.params,
            queryStringParameters: req.query,
            file: req.file // multerで処理されたファイル情報
        };
        
        const context = {
            functionName: 'profileImageHandler',
            requestId: `req-${Date.now()}`,
            getRemainingTimeInMillis: () => 30000
        };
        
        console.log(`📝 ${req.method} ${req.path} - Processing image upload...`);
        
        // Lambda関数を直接呼び出し
        const result = await profileImageHandler.handler(event, context);
        
        const statusCode = result.statusCode || 200;
        let body;
        try {
            body = JSON.parse(result.body);
        } catch (e) {
            body = result.body;
        }

        // レスポンス形式の標準化
        const response = {
            success: statusCode >= 200 && statusCode < 300,
            data: body.data || body,
            requestId: context.requestId
        };
        
        console.log(`✅ ${req.method} ${req.path} - Status: ${statusCode}`);
        res.status(statusCode).json(response);
        
    } catch (error) {
        console.error('❌ Image upload error:', error);
        const errorResponse = {
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Internal server error',
                details: error.details || error.stack
            },
            requestId: `req-${Date.now()}`
        };
        res.status(500).json(errorResponse);
    }
});

// 設定画面API
app.post('/api/settings/user-profile/:userId/student-id-image', upload.single('image'), async (req, res) => {
    // Multerで受け取ったファイルをBase64に変換
    const fileData = {
        image: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        contentType: req.file.mimetype,
        fileName: req.file.originalname
    };
    
    // イベントオブジェクトを作成
    const event = {
        pathParameters: { userId: req.params.userId },
        body: JSON.stringify(fileData)
    };
    
    const result = await studentIdImageHandler.handler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
});
console.log('⚙️ Settings screen API endpoints registered');

// 設定画面API
app.put('/api/settings/user-profile/:userId/title-alias', async (req, res) => {
    await wrapLambda(titleAliasSettingsHandler.handler, req, res);
});

// 設定画面API
app.delete('/api/settings/user-profile/:userId/image', async (req, res) => {
    await wrapLambda(imageDeleteHandler.handler, req, res);
});

// デバッグ用エンドポイント - Redis状態確認
app.get('/debug/redis', async (req, res) => {
    try {
        const Redis = require("ioredis");
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || '',
        });

        // Redis接続テスト
        const pingResult = await redis.ping();
        
        // 現在のマッチ情報を取得
        const matchKeys = await redis.keys('match:*');
        const matchData = {};
        
        for (const key of matchKeys) {
            matchData[key] = await redis.hgetall(key);
        }

        await redis.quit();

        res.json({
            success: true,
            redis_status: 'connected',
            ping_result: pingResult,
            active_matches: matchData,
            match_count: matchKeys.length
        });
    } catch (error) {
        console.error('Redis デバッグエラー:', error);
        res.status(500).json({
            success: false,
            redis_status: 'error',
            error: error.message
        });
    }
});

// デバッグ用エンドポイント - マッチ強制クリア
app.post('/debug/clear-matches', async (req, res) => {
    try {
        const Redis = require("ioredis");
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || '',
        });

        const matchKeys = await redis.keys('match:*');
        if (matchKeys.length > 0) {
            await redis.del(...matchKeys);
        }

        await redis.quit();

        res.json({
            success: true,
            message: `${matchKeys.length}個のマッチをクリアしました`,
            cleared_matches: matchKeys
        });
    } catch (error) {
        console.error('マッチクリアエラー:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

console.log('🔧 Debug endpoints registered');

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
    console.log('🔥 All endpoints ready!');
    console.log('🚀 ===================================');
});