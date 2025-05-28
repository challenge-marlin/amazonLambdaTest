# VPSデプロイ手順書 - じゃんけんゲームAPI

このドキュメントは、AWS SAMで開発されたじゃんけんゲームAPIをVPS（Virtual Private Server）にデプロイするための手順を説明します。

## 前提条件

- Ubuntu 20.04 LTS以上のVPS
- 最低2GB RAM、20GB ストレージ
- root権限またはsudo権限を持つユーザー
- インターネット接続

## 1. VPSへのSSHログイン

```bash
# VPSにSSHでログイン
ssh username@your-vps-ip-address

# または、秘密鍵を使用する場合
ssh -i "C:\Users\USER\Documents\.ssh\key-2025-05-19-13-32.pem" root@160.251.137.105
```


## 2. システムの更新とパッケージのインストール

```bash
# システムパッケージの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Dockerのインストール
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Dockerサービスの開始と自動起動設定
sudo systemctl start docker
sudo systemctl enable docker

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# Node.js 20.xのインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nginxのインストール（リバースプロキシ用）
sudo apt install -y nginx

# 一度ログアウトして再ログインしてdockerグループの権限を有効化
exit
```

再度SSHでログインしてください：
```bash
ssh username@your-vps-ip-address
```

## 3. プロジェクトのデプロイ

```bash
# プロジェクト用ディレクトリの作成
mkdir -p ~/apps
cd ~/apps

# プロジェクトのクローン（またはファイル転送）
# GitHubからクローンする場合：
git clone <your-repository-url> janken-api
cd janken-api

# または、ローカルからファイルを転送する場合：
# scp -r ./awsTest username@your-vps-ip-address:~/apps/janken-api
```

## 4. VPS用の設定ファイルの作成

### 4.1 VPS用Docker Composeファイルの作成

```bash
cd ~/apps/janken-api

# VPS用のdocker-compose.vps.ymlを作成
cat > docker-compose.vps.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: janken-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-secure_root_password_2024}
      MYSQL_DATABASE: jankendb
      MYSQL_USER: lambda_user
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-secure_lambda_password_2024}
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./doc/sql/create_tables.sql:/docker-entrypoint-initdb.d/01-create-tables.sql:ro
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6.2
    container_name: janken-redis
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-secure_redis_password_2024}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-secure_redis_password_2024}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api-server:
    build:
      context: .
      dockerfile: Dockerfile.vps
    container_name: janken-api
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-secure_redis_password_2024}
      - DB_HOST=mysql
      - DB_USER=lambda_user
      - DB_PASSWORD=${MYSQL_PASSWORD:-secure_lambda_password_2024}
      - DB_NAME=jankendb
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

networks:
  app-network:
    name: janken-network

volumes:
  mysql_data:
  redis_data:
EOF
```

### 4.2 VPS用Dockerfileの作成

```bash
# VPS用のDockerfileを作成
cat > Dockerfile.vps << 'EOF'
FROM node:20-alpine

WORKDIR /app

# システムパッケージの更新とタイムゾーン設定
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    echo "Asia/Tokyo" > /etc/timezone

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# ログディレクトリの作成
RUN mkdir -p /app/logs

# 非rootユーザーの作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# ファイルの所有権を変更
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
EOF
```

### 4.3 Express.jsサーバーファイルの作成

```bash
# VPS用のExpressサーバーを作成
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ログ設定
const fs = require('fs');
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Lambda関数をExpressルートとして読み込み
const handHandler = require('./lambda/hand/index');
const judgeHandler = require('./lambda/judge/index');
const loginHandler = require('./lambda/login/index');
const testHandler = require('./lambda/test/index');
const userHandler = require('./lambda/user/index');
const userStatsHandler = require('./lambda/user-stats/index');

// Lambda関数をExpressハンドラーに変換するヘルパー
const lambdaToExpress = (lambdaHandler) => {
  return async (req, res) => {
    try {
      const event = {
        httpMethod: req.method,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query,
        headers: req.headers,
        body: JSON.stringify(req.body)
      };

      const result = await lambdaHandler.handler(event);
      
      res.status(result.statusCode);
      
      if (result.headers) {
        Object.keys(result.headers).forEach(key => {
          res.set(key, result.headers[key]);
        });
      }
      
      res.send(result.body);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// ルート設定
app.post('/hand', lambdaToExpress(handHandler));
app.post('/judge', lambdaToExpress(judgeHandler));
app.post('/login', lambdaToExpress(loginHandler));
app.post('/test/user', lambdaToExpress(testHandler));
app.get('/users/:userId', lambdaToExpress(testHandler));
app.get('/api/user', lambdaToExpress(userHandler));
app.put('/api/user', lambdaToExpress(userHandler));
app.post('/api/user/profile-image', lambdaToExpress(userHandler));
app.get('/api/user-stats/:userId', lambdaToExpress(userStatsHandler));
app.put('/api/user-stats/:userId', lambdaToExpress(userStatsHandler));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// エラーハンドラー
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
EOF
```

### 4.4 環境変数ファイルの作成

```bash
# .envファイルを作成（本番環境用の強力なパスワードを設定）
cat > .env << 'EOF'
# データベース設定
MYSQL_ROOT_PASSWORD=secure_root_password_2024_$(date +%s)
MYSQL_PASSWORD=secure_lambda_password_2024_$(date +%s)

# Redis設定
REDIS_PASSWORD=secure_redis_password_2024_$(date +%s)

# アプリケーション設定
NODE_ENV=production
PORT=3000
EOF

# .envファイルの権限を制限
chmod 600 .env
```

### 4.5 package.jsonの更新

```bash
# Express.jsとCORSの依存関係を追加
npm install express cors

# または、package.jsonを直接編集
cat > package.json << 'EOF'
{
  "name": "janken-game-api",
  "version": "1.0.0",
  "description": "Janken Game API for VPS deployment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "mocha 'lambda/*/tests/**/*.js'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ioredis": "^5.3.2",
    "mysql2": "^3.6.0",
    "redis": "^5.0.1"
  },
  "devDependencies": {
    "chai": "^4.3.7",
    "mocha": "^10.2.0",
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
EOF
```

## 5. アプリケーションのビルドと起動

```bash
# 依存関係のインストール
npm install

# Dockerイメージのビルドとコンテナの起動
docker-compose -f docker-compose.vps.yml up -d --build

# コンテナの状態確認
docker-compose -f docker-compose.vps.yml ps

# ログの確認
docker-compose -f docker-compose.vps.yml logs -f api-server
```

## 6. Nginxリバースプロキシの設定

```bash
# Nginxの設定ファイルを作成
sudo tee /etc/nginx/sites-available/janken-api << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # ドメイン名に変更してください

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API プロキシ
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # タイムアウト設定
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ログ設定
    access_log /var/log/nginx/janken-api.access.log;
    error_log /var/log/nginx/janken-api.error.log;
}
EOF

# 設定ファイルを有効化
sudo ln -s /etc/nginx/sites-available/janken-api /etc/nginx/sites-enabled/

# デフォルトサイトを無効化
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx設定のテスト
sudo nginx -t

# Nginxの再起動
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 7. ファイアウォールの設定

```bash
# UFWファイアウォールの設定
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# ファイアウォールの状態確認
sudo ufw status
```

## 8. SSL証明書の設定（Let's Encrypt）

```bash
# Certbotのインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書の取得（ドメイン名を実際のものに変更してください）
sudo certbot --nginx -d your-domain.com

# 自動更新の設定
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 9. 動作確認

```bash
# ヘルスチェック
curl http://localhost:3000/health

# または外部から
curl http://your-domain.com/health

# APIテスト
curl -X POST http://your-domain.com/test/user \
  -H "Content-Type: application/json" \
  -d '{"userId": "test001"}'
```

## 10. 監視とログ管理

### 10.1 ログローテーションの設定

```bash
# ログローテーション設定
sudo tee /etc/logrotate.d/janken-api << 'EOF'
/home/*/apps/janken-api/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        docker-compose -f /home/*/apps/janken-api/docker-compose.vps.yml restart api-server
    endscript
}
EOF
```

### 10.2 システムサービスの作成（オプション）

```bash
# systemdサービスファイルの作成
sudo tee /etc/systemd/system/janken-api.service << EOF
[Unit]
Description=Janken Game API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$(whoami)/apps/janken-api
ExecStart=/usr/local/bin/docker-compose -f docker-compose.vps.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.vps.yml down
User=$(whoami)
Group=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

# サービスの有効化
sudo systemctl enable janken-api.service
sudo systemctl start janken-api.service
```

## 11. バックアップの設定

```bash
# バックアップスクリプトの作成
mkdir -p ~/scripts
cat > ~/scripts/backup-janken.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/$(whoami)/apps/janken-api"

# バックアップディレクトリの作成
mkdir -p $BACKUP_DIR

# データベースバックアップ
docker exec janken-mysql mysqldump -u lambda_user -p$MYSQL_PASSWORD jankendb > $BACKUP_DIR/jankendb_$DATE.sql

# アプリケーションファイルのバックアップ
tar -czf $BACKUP_DIR/janken-api_$DATE.tar.gz -C $APP_DIR .

# 古いバックアップの削除（30日以上古いもの）
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/scripts/backup-janken.sh

# crontabでバックアップを自動化（毎日午前2時）
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$(whoami)/scripts/backup-janken.sh >> /home/$(whoami)/logs/backup.log 2>&1") | crontab -
```

## 12. トラブルシューティング

### 12.1 よくある問題と解決方法

```bash
# コンテナの状態確認
docker-compose -f docker-compose.vps.yml ps

# ログの確認
docker-compose -f docker-compose.vps.yml logs api-server
docker-compose -f docker-compose.vps.yml logs mysql
docker-compose -f docker-compose.vps.yml logs redis

# コンテナの再起動
docker-compose -f docker-compose.vps.yml restart

# 完全な再構築
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up -d --build

# ディスク使用量の確認
df -h
docker system df

# 不要なDockerリソースの削除
docker system prune -f
```

### 12.2 パフォーマンス監視

```bash
# システムリソースの監視
htop
iostat 1
free -h

# Dockerコンテナのリソース使用量
docker stats
```

## 13. セキュリティ強化（推奨）

```bash
# SSH設定の強化
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# fail2banのインストール
sudo apt install -y fail2ban

# 自動セキュリティアップデートの有効化
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 14. 完了確認

デプロイが完了したら、以下のエンドポイントで動作確認を行ってください：

- `GET http://your-domain.com/health` - ヘルスチェック
- `POST http://your-domain.com/test/user` - ユーザー情報取得テスト
- `POST http://your-domain.com/hand` - 手の送信API
- `POST http://your-domain.com/judge` - 勝敗判定API

## 注意事項

1. **セキュリティ**: 本番環境では必ず強力なパスワードを設定し、定期的に更新してください
2. **ドメイン**: `your-domain.com` を実際のドメイン名に変更してください
3. **SSL証明書**: Let's Encryptの証明書は90日で期限切れになるため、自動更新が正しく設定されていることを確認してください
4. **バックアップ**: 定期的なバックアップを必ず実行してください
5. **監視**: ログとシステムリソースを定期的に監視してください

このデプロイ手順により、AWS SAMアプリケーションをVPS上で動作させることができます。 