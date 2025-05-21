# AWS SAM User Management API

このプロジェクトは、AWS SAMを使用したユーザー管理APIの実装です。

## 前提条件

- Docker Desktop
- AWS CLI
- AWS SAM CLI
- Node.js 18.x

## セットアップ手順

### 1. AWS SAM CLIのインストール

Windowsの場合：
```bash
# Chocolateyを使用する場合
choco install aws-sam-cli

# または、インストーラーを使用する場合
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html
```
インストールを確認
```bash
sam --version
```

### 2. プロジェクトのセットアップ

1. プロジェクトディレクトリに移動：
```bash
cd awsTest
```

2. 依存関係をインストール：
```bash
npm install
```

3. ローカル開発環境を起動：
```bash
docker-compose up -d
```

4. データベースの初期化：
```bash
# MySQLコンテナに接続
docker exec -it awstest-mysql-1 mysql -uroot -ppassword

# データベースに接続
use userdb;

# テーブルを作成
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. SAMアプリケーションをローカルで実行：
```bash
# Dockerネットワークを指定してSAMアプリケーションを起動
sam local start-api --docker-network awstest_default
```

注意: `--docker-network` パラメータには、`docker-compose.yml`で定義されたネットワーク名を指定します。
デフォルトでは、プロジェクト名（この場合は`awstest`）に`_default`を付けた名前になります。

## プロジェクト構造

```
awsTest/
├── template.yaml              ← SAM構成
├── lambda/                    ← Lambda関数群
│   ├── getUser.js
│   └── createUser.js
├── models/                    ← Model層
│   ├── userModel.js
│   └── sessionModel.js
├── utils/                     ← 共通ユーティリティ
│   ├── db.js
│   └── redisClient.js
├── events/                    ← テストイベントJSON
├── docker-compose.yml         ← ローカル開発用
└── README.md
```

## テストイベント

`events/` ディレクトリに以下のテストイベントを作成します：

1. `events/get-user-event.json`:
```json
{
  "pathParameters": {
    "userId": "1"
  }
}
```

2. `events/create-user-event.json`:
```json
{
  "body": "{\"name\":\"テストユーザー\",\"email\":\"test@example.com\"}"
}
```

## APIエンドポイント

- GET /users/{userId} - ユーザー情報の取得
- POST /users - 新規ユーザーの作成

## 環境変数

以下の環境変数は`template.yaml`の`Globals.Function.Environment.Variables`セクションで設定されています：

```yaml
Environment:
  Variables:
    DB_HOST: localhost
    DB_USER: root
    DB_PASSWORD: password
    DB_NAME: userdb
    REDIS_HOST: localhost
    REDIS_PORT: 6379
    REDIS_PASSWORD: ""
```

これらの値は、ローカル開発環境用に設定されています。本番環境にデプロイする場合は、適切な値に変更してください。

環境変数を変更する場合は、`template.yaml`を編集した後、以下のコマンドでSAMアプリケーションを再起動してください：

```bash
sam local start-api
```

## テスト

テストイベントを使用してローカルでテストを実行：

```bash
# ユーザー取得のテスト
sam local invoke GetUserFunction -e events/get-user-event.json

# ユーザー作成のテスト
sam local invoke CreateUserFunction -e events/create-user-event.json
```
APIエンドポイントは以下のURLでアクセスできます：
GET http://localhost:3000/users/{userId}
POST http://localhost:3000/users


## トラブルシューティング

1. Dockerコンテナが起動しない場合：
   - Docker Desktopが起動していることを確認
   - ポートの競合がないことを確認

2. データベース接続エラー：
   - 環境変数が正しく設定されていることを確認
   - MySQLコンテナが正常に起動していることを確認
   - データベースとテーブルが正しく作成されていることを確認

3. Redis接続エラー：
   - Redisコンテナが正常に起動していることを確認
   - ポートの競合がないことを確認

4. SAM CLIのエラー：
   - AWS SAM CLIが正しくインストールされていることを確認
   - バージョンを確認：`sam --version`
   - 必要に応じて再インストールを実行 