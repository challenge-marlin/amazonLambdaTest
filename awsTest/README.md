# じゃんけんゲーム SAMアプリケーション

このプロジェクトは、AWS SAMを使用したサーバーレスアプリケーションです。じゃんけんゲームのバックエンドAPIを提供します。

## 機能概要

- じゃんけん対戦
  - 手の送信（グー、チョキ、パー）
  - 勝敗判定
  - 引き分け処理
- マッチング管理
  - ランダムマッチング
  - フレンド対戦
- テスト機能
  - ユーザー情報取得
  - Redis接続確認

## 技術スタック

- Runtime: Node.js 20.x
- Framework: AWS SAM
- Cache: Redis
- Database: MySQL
- 開発環境: Docker + docker-compose

## 設定可能なパラメータ

### 環境変数（env.json）

- `MAX_DRAW_COUNT`: 最大引き分け回数（デフォルト: 3）
  - 引き分けが連続でこの回数に達した場合、ゲーム終了となります
- `REDIS_HOST`: Redisサーバーのホスト名
- `REDIS_PORT`: Redisサーバーのポート番号
- `REDIS_PASSWORD`: Redisサーバーのパスワード
- `DB_HOST`: MySQLサーバーのホスト名
- `DB_USER`: MySQLのユーザー名
- `DB_PASSWORD`: MySQLのパスワード
- `DB_NAME`: データベース名

## API エンドポイント

### 手の送信 API
- POST /hand
  ```json
  {
    "userId": "user123",
    "matchingId": "match456",
    "hand": "グー",
    "matchType": "random"
  }
  ```
  - レスポンス（相手待ち）
    ```json
    {
      "success": true,
      "message": "手を送信しました",
      "status": "waiting",
      "statusMessage": "相手の手を待っています",
      "canJudge": false,
      "matchData": {
        "matchingId": "match456",
        "player1_id": "user123",
        "player2_id": "user456",
        "yourHand": "グー",
        "roundNumber": 1
      }
    }
    ```
  - レスポンス（両者の手が揃った）
    ```json
    {
      "success": true,
      "message": "手を送信しました",
      "status": "ready",
      "statusMessage": "両プレイヤーの手が揃いました。判定可能です。",
      "canJudge": true,
      "matchData": {
        "matchingId": "match456",
        "player1_id": "user123",
        "player2_id": "user456",
        "yourHand": "グー",
        "roundNumber": 1
      }
    }
    ```

### 勝敗判定 API
- POST /judge
  ```json
  {
    "matchingId": "match456"
  }
  ```
  - レスポンス（勝敗決定時）
    ```json
    {
      "success": true,
      "result": {
        "player1_hand": "グー",
        "player2_hand": "チョキ",
        "player1_result": "win",
        "player2_result": "lose",
        "winner": 1,
        "is_draw": false,
        "draw_count": 0,
        "judged": true,
        "judged_at": "2025-05-27T07:40:55.906Z",
        "is_finished": true,
        "finish_reason": null
      }
    }
    ```
  - レスポンス（引き分け時）
    ```json
    {
      "success": true,
      "result": {
        "player1_hand": "グー",
        "player2_hand": "グー",
        "player1_result": "draw",
        "player2_result": "draw",
        "winner": 3,
        "is_draw": true,
        "draw_count": 1,
        "judged": true,
        "judged_at": "2025-05-27T07:40:55.906Z",
        "is_finished": false,
        "finish_reason": null
      }
    }
    ```
  - レスポンス（最大引き分け回数到達時）
    ```json
    {
      "success": true,
      "result": {
        "player1_hand": "グー",
        "player2_hand": "グー",
        "player1_result": "draw",
        "player2_result": "draw",
        "winner": 3,
        "is_draw": true,
        "draw_count": 3,
        "judged": true,
        "judged_at": "2025-05-27T07:40:55.906Z",
        "is_finished": true,
        "finish_reason": "max_draw_reached"
      }
    }
    ```

### ログイン API
- POST /login
  ```json
  {
    "userId": "user001",
    "password": "password001"
  }
  ```
  - レスポンス（成功時）
    ```json
    {
      "success": true,
      "user": {
        "user_id": "user001",
        "nickname": "やまだ",
        "title": "title_001",
        "alias": "skill",
        "profile_image_url": "https://lesson01.myou-kou.com/avatars/defaultAvatar1.png"
      }
    }
    ```
  - レスポンス（失敗時）
    ```json
    {
      "success": false,
      "message": "ユーザーIDまたはパスワードが正しくありません"
    }
    ```

### ユーザー情報取得 API
- GET /users/{userId}
  - レスポンス
    ```json
    {
      "success": true,
      "redisStatus": "available",
      "userInfo": {
        "user_id": "user001",
        "name": "山田 太郎",
        "nickname": "やまだ",
        "total_wins": 153,
        "current_win_streak": 1
        // ... その他のユーザー情報
      }
    }
    ```

## ローカル開発環境のセットアップ

### 前提条件

以下のツールが必要です：

- Docker Desktop
- AWS SAM CLI
- Node.js 20.x（推奨）または18.x
- npm 8.x以上

### 1. AWS SAM CLIのインストール

Windowsの場合：
```bash
# Chocolateyを使用する場合
choco install aws-sam-cli

# または、インストーラーを使用する場合
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install-windows.html
```

### 2. プロジェクトのセットアップ

```bash
# プロジェクトのクローン
git clone <repository-url>
cd awsTest

# 依存関係のインストール
npm install

# Dockerコンテナのビルドと起動（nginx含む）
docker-compose build
docker-compose up -d

# コンテナの状態確認
docker-compose ps

# データベースの初期化
# 注: create_tables.sqlとseed_base.sqlは自動的に実行されます

# 追加のサンプルデータ（必要に応じて）
docker-compose exec mysql mysql -u lambda_user -plambda_password jankendb -e "source /sql/seed_users.sql"
docker-compose exec mysql mysql -u lambda_user -plambda_password jankendb -e "source /sql/seed_user_stats.sql"
docker-compose exec mysql mysql -u lambda_user -plambda_password jankendb -e "source /sql/seed_match_history.sql"
docker-compose exec mysql mysql -u lambda_user -plambda_password jankendb -e "source /sql/seed_daily_ranking.sql"

# クリーンアップ（SQLファイルの削除）
docker-compose exec mysql rm /create_tables.sql /seed_base.sql /seed_users.sql /seed_user_stats.sql /seed_match_history.sql /seed_daily_ranking.sql
```

### 3. 開発サーバーの起動

#### 方法1: ローカルマシンのみでアクセス
```bash
# SAMアプリケーションの起動（バックグラウンドのDockerネットワークを使用）
cd awsTest
sam local start-api --docker-network awstest-network --env-vars env.json --warm-containers EAGER

# APIエンドポイント: http://localhost:3000
```

#### 方法2: ローカルネットワークの他のユーザーからもアクセス可能
```bash
# 1. Dockerコンテナを起動
docker-compose up -d

# 2. AWS SAM Localを起動（別のターミナルで）
# Windows:
start-sam-local.bat

# Linux/Mac:
./start-sam-local.sh

# APIエンドポイント: 
# - ローカル: http://localhost:8080
# - ネットワーク内の他のPC: http://[あなたのIPアドレス]:8080
```

#### IPアドレスの確認方法
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
# または
ip addr show
```

### 4. APIテスト

```bash
# ローカルアクセス
GET http://localhost:8080/users/user001
POST http://localhost:8080/hand
POST http://localhost:8080/judge
POST http://localhost:8080/login

# ネットワーク内の他のPCから
GET http://192.168.1.100:8080/users/user001  # 192.168.1.100は例
POST http://192.168.1.100:8080/hand
POST http://192.168.1.100:8080/judge
POST http://192.168.1.100:8080/login
```

### 5. nginx設定について

nginxはリバースプロキシとして以下の機能を提供します：

- **外部アクセス**: ローカルネットワーク内の他のデバイスからAPIにアクセス可能
- **CORS設定**: クロスオリジンリクエストの自動処理
- **ヘルスチェック**: `/health`エンドポイントでサービス状態確認
- **ロードバランシング**: 将来的な拡張に対応

nginx設定ファイル（`nginx.conf`）をカスタマイズすることで、SSL終端やキャッシュ設定なども追加できます。

### 6. テストの実行

```bash
# すべてのテストを実行
npm test

# 特定の関数のテストのみ実行
cd lambda/hand && npm test
cd lambda/judge && npm test
cd lambda/test && npm test
```

### 7. 依存関係の管理

このプロジェクトではnpm workspacesを使用して依存関係を管理しています：

```bash
# 依存関係のクリーンアップ
npm run clean

# すべての依存関係を再インストール
npm install

# 本番用の依存関係のみをインストール
npm install --production
```

### 8. トラブルシューティング

#### データベース接続の確認
```bash
# MySQLコンテナへの接続テスト
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb -e "SELECT 1"

# データベースの状態確認
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb -e "SHOW TABLES"

# データベースの再初期化（必要な場合）
docker-compose exec mysql mysql -u lambda_user -plambda_password < doc/sql/create_tables.sql
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb < doc/sql/seed_base.sql

# MySQLへの直接ログイン
# 対話型のMySQLクライアントを起動
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb

# よく使うMySQLコマンド
# - データベース一覧の表示: SHOW DATABASES;
# - テーブル一覧の表示: SHOW TABLES;
# - テーブル構造の確認: DESCRIBE テーブル名;
# - 終了: EXIT または \q
```

#### Redis接続の確認
```bash
# Redisコンテナの状態確認
docker-compose exec redis redis-cli ping

# Redisへの接続テスト
docker-compose exec redis redis-cli -h localhost -p 6379
```

#### 環境変数の確認
```bash
# 現在の環境変数を表示
sam local env vars

# カスタム環境変数でLambda関数を実行
sam local invoke TestFunction \
  --event events/test-event.json \
  --docker-network awstest-network \
  --parameter-overrides "ParameterKey=AWS::Region,ParameterValue=local" \
  --env-vars env.json
```

環境変数ファイルの例（env.json）:
```json
{
  "Parameters": {
    "DB_HOST": "mysql",
    "DB_USER": "lambda_user",
    "DB_PASSWORD": "lambda_password",
    "DB_NAME": "userdb",
    "REDIS_HOST": "redis",
    "REDIS_PORT": "6379"
  }
}
```

### 9. デプロイ

```bash
# ビルド
npm run build

# デプロイ（初回）
npm run deploy -- --guided

# 2回目以降のデプロイ
npm run deploy
```

## プロジェクト構造

```
.
├── lambda/                   # Lambda関数群
│   ├── hand/                # 手の送信機能
│   │   ├── index.js
│   │   └── package.json
│   ├── judge/              # 勝敗判定機能
│   │   ├── index.js
│   │   └── package.json
│   └── test/               # テスト機能
│       ├── index.js
│       └── package.json
├── utils/                   # 共通ユーティリティ
│   └── redis/              # Redis関連
│       └── redisUtil.js
├── events/                  # テストイベント
│   ├── hand-event.json
│   ├── judge-event.json
│   └── test-event.json
├── template.yaml           # SAM構成
└── docker-compose.yml      # ローカル開発用
```

## 開発ガイドライン

### コーディング規約
- ESLintとPrettierを使用してコードの品質を維持
- 関数にはJSDocでドキュメントを記述

### Git運用ルール
- ブランチ命名規則: `feature/機能名`
- コミットメッセージは日本語で具体的に記述
- PRは必ずレビューを受けること

## デプロイ

```bash
# ビルド
sam build

# デプロイ（初回）
sam deploy --guided

# 2回目以降のデプロイ
sam deploy
```

## 環境変数

以下の環境変数が必要です：

```yaml
# Redis設定
REDIS_HOST: Redis ホスト名
REDIS_PORT: Redis ポート番号（デフォルト: 6379）
REDIS_PASSWORD: Redis パスワード（必要な場合）

# データベース設定
DB_HOST: データベースホスト名
DB_USER: データベースユーザー
DB_PASSWORD: データベースパスワード
DB_NAME: データベース名
```

## トラブルシューティング

### ローカル環境の問題

1. Redisに接続できない：
   ```bash
   # Redisコンテナの状態確認
   docker ps
   # ログの確認
   docker logs awstest-redis-1
   ```

2. SAM APIのエラー：
   ```bash
   # ログの詳細表示
   sam local start-api --docker-network awstest_default --debug
   ```

3. データベース接続エラー：
   ```bash
   # MySQLコンテナの状態確認
   docker ps
   # ログの確認
   docker logs awstest-mysql-1
   ```

### デプロイの問題

1. VPCエンドポイントの確認：
   - CloudWatch Logs
   - Redis (ElastiCache)
   - RDS

2. セキュリティグループの確認：
   - Lambda → Redis (6379)
   - Lambda → RDS (3306)
   - Lambda → インターネット (443)

## 運用管理

### モニタリング
- CloudWatch Metricsによる監視
- CloudWatch Logsによるログ収集
- X-Rayによるトレース

### セキュリティ
- SSL/TLS通信の強制
- セキュリティグループの最小権限設定
- IAMロールの最小権限設定
- 機密情報のParameter Store管理

## 依存関係の管理

このプロジェクトでは、npm workspacesを使用して依存関係を管理しています。

### 構造
```
awsTest/
├── package.json          # プロジェクト全体の依存関係
├── node_modules/        # 共有の依存パッケージ
└── lambda/
    ├── hand/
    │   └── package.json  # handモジュール固有の設定
    ├── judge/
    │   └── package.json  # judgeモジュール固有の設定
    └── test/
        └── package.json  # testモジュール固有の設定
```

### 依存関係のインストール

```bash
# プロジェクト全体の依存関係をインストール
npm install

# または、すべての依存関係（開発用含む）をインストール
npm run install-all

# 本番用の依存関係のみをインストール
npm install --production
```

### パッケージの追加

```bash
# プロジェクト全体に共通のパッケージを追加
npm install パッケージ名

# 特定のLambda関数にパッケージを追加
cd lambda/関数名
npm install パッケージ名
```

### 注意点

1. 共通の依存関係（ioredis, mysql2）はルートの`package.json`で管理
2. Lambda関数固有の依存関係は各関数の`package.json`で管理
3. テスト関連のパッケージはdevDependenciesとしてルートで管理 

### データベース操作

#### MySQLへのアクセス方法

1. 対話型モードでログイン
```bash
# 対話型のMySQLクライアントを起動
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb
```

2. 直接クエリを実行
```bash
# 単一のクエリを実行
docker-compose exec mysql mysql -u lambda_user -plambda_password userdb -e "SELECT * FROM users LIMIT 5"
```

#### よく使うMySQLコマンド

```sql
-- データベース操作
SHOW DATABASES;              -- データベース一覧
USE userdb;                  -- データベースの選択
SHOW TABLES;                -- テーブル一覧

-- テーブル情報
DESCRIBE users;             -- テーブル構造の確認
SHOW CREATE TABLE users;    -- テーブル作成文の表示

-- データ確認
SELECT * FROM users LIMIT 5;                    -- ユーザーデータの確認
SELECT * FROM match_history ORDER BY fight_no DESC LIMIT 5;  -- 最新の対戦履歴
SELECT * FROM user_stats WHERE total_wins > 10;  -- 勝利数の多いユーザー

-- 終了
EXIT;  -- または \q
```

#### バックアップとリストア

```bash
# データベースのバックアップ
docker-compose exec mysql mysqldump -u lambda_user -plambda_password userdb > backup.sql

# バックアップからのリストア
docker-compose exec -T mysql mysql -u lambda_user -plambda_password userdb < backup.sql
```

### 運用管理 