# ユーザーAPI ローカルテストガイド

このドキュメントでは、ユーザーAPI（UserFunction、UserStatsFunction）のローカルテスト手順を説明します。

## 前提条件

1. Docker Desktop がインストールされていること
2. AWS SAM CLI がインストールされていること
3. Node.js 20.x がインストールされていること

## セットアップ

### 1. 依存関係のインストール

```bash
# プロジェクトルートで実行
cd awsTest
npm install

# 各Lambda関数の依存関係をインストール
cd lambda/user && npm install && cd ../..
cd lambda/user-stats && npm install && cd ../..
```

### 2. ローカル環境の起動

```bash
# Docker ComposeでデータベースとRedisを起動
docker-compose up -d

# データベースの初期化（初回のみ）
# MySQLコンテナに接続してテーブルを作成
docker exec -it awstest-mysql-1 mysql -u lambda_user -plambda_password jankendb

# SQLファイルを実行（プロジェクトルートから）
# source /path/to/doc/sql/create_tables.sql
# source /path/to/doc/sql/seed_base.sql
```

### 3. SAMアプリケーションのビルド

```bash
sam build
```

## ローカルテスト

### 1. ユーザープロフィール取得API

```bash
# ユーザー情報を取得
sam local invoke UserFunction --event events/user-get.json --env-vars env.json
```

期待されるレスポンス:
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"data\":{\"user\":{\"userId\":\"user001\",\"nickname\":\"テストユーザー\",\"name\":\"テスト太郎\",\"email\":\"test@example.com\",...}}}"
}
```

### 2. ユーザープロフィール更新API

```bash
# ユーザー情報を更新
sam local invoke UserFunction --event events/user-update.json --env-vars env.json
```

期待されるレスポンス:
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"data\":{\"user\":{\"userId\":\"user001\",\"name\":\"更新太郎\",\"nickname\":\"タロウ\",...}}}"
}
```

### 3. ユーザーステータス取得API

```bash
# ユーザーステータスを取得
sam local invoke UserStatsFunction --event events/user-stats-get.json --env-vars env.json
```

期待されるレスポンス:
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"data\":{\"stats\":{\"userId\":\"user001\",\"winCount\":0,\"loseCount\":0,\"drawCount\":0,...}}}"
}
```

### 4. ユーザーステータス更新API

```bash
# ユーザーステータスを更新
sam local invoke UserStatsFunction --event events/user-stats-update.json --env-vars env.json
```

期待されるレスポンス:
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"data\":{\"stats\":{\"userId\":\"user001\",\"title\":\"上級者\",\"alias\":\"じゃんけんマスター\",...}}}"
}
```

## API Gateway経由でのテスト

### 1. ローカルAPI Gatewayの起動

```bash
sam local start-api --env-vars env.json --port 3000
```

### 2. cURLでのテスト

```bash
# ユーザー取得
curl -X GET "http://localhost:3000/api/user?userId=user001"

# ユーザー更新
curl -X PUT "http://localhost:3000/api/user?userId=user001" \
  -H "Content-Type: application/json" \
  -d '{"name": "更新太郎", "nickname": "タロウ", "email": "updated@example.com"}'

# ユーザーステータス取得
curl -X GET "http://localhost:3000/api/user-stats/user001"

# ユーザーステータス更新
curl -X PUT "http://localhost:3000/api/user-stats/user001" \
  -H "Content-Type: application/json" \
  -d '{"title": "上級者", "alias": "じゃんけんマスター"}'
```

## トラブルシューティング

### 1. データベース接続エラー

```bash
# MySQLコンテナの状態確認
docker ps | grep mysql

# MySQLログの確認
docker logs awstest-mysql-1

# データベース接続テスト
docker exec -it awstest-mysql-1 mysql -u lambda_user -plambda_password jankendb -e "SELECT 1;"
```

### 2. Redis接続エラー

```bash
# Redisコンテナの状態確認
docker ps | grep redis

# Redis接続テスト
docker exec -it awstest-redis-1 redis-cli ping
```

### 3. Lambda関数のログ確認

```bash
# SAM CLIのログを詳細表示
sam local invoke UserFunction --event events/user-get.json --env-vars env.json --log-file /tmp/sam.log

# ログファイルの確認
tail -f /tmp/sam.log
```

## 環境変数

`env.json`ファイルで以下の環境変数が設定されています：

```json
{
  "UserFunction": {
    "DB_HOST": "mysql",
    "DB_USER": "lambda_user",
    "DB_PASSWORD": "lambda_password",
    "DB_NAME": "jankendb",
    "REDIS_HOST": "redis",
    "REDIS_PORT": "6379",
    "REDIS_PASSWORD": ""
  },
  "UserStatsFunction": {
    "DB_HOST": "mysql",
    "DB_USER": "lambda_user",
    "DB_PASSWORD": "lambda_password",
    "DB_NAME": "jankendb",
    "REDIS_HOST": "redis",
    "REDIS_PORT": "6379",
    "REDIS_PASSWORD": ""
  }
}
```

## 注意事項

1. ローカルテスト時は、Docker Composeで起動したMySQLとRedisを使用します
2. プロフィール画像アップロード機能は、実際のS3アップロードではなくダミーURLを返します
3. 認証機能は実装されていません（ユーザーIDのみでアクセス可能）
4. 本番環境では、Parameter Storeから環境変数を取得します 