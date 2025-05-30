# VPSデプロイ手順書 - SAM Localを使用したじゃんけんゲームAPI

このドキュメントは、AWS SAMで開発されたじゃんけんゲームAPIをVPS（Virtual Private Server）にデプロイするための**簡素化された**手順を説明します。

**重要**: この手順はローカル環境との互換性を最大限保ち、SAM Localを使用してVPS上でもローカルと同じように動作させることを目的としています。

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
ssh -i "path/to/your/key.pem" username@your-vps-ip-address
ssh -i "C:\Users\USER\Documents\.ssh\key-2025-05-19-13-32.pem" root@160.251.137.105
```
cd /home/lambda_user/apps/awsTest/ 

## 2. 必要なソフトウェアのインストール

```bash
# システムパッケージの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
sudo apt install -y curl wget git unzip

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Composeのインストール
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Dockerサービスの開始と自動起動設定
sudo systemctl start docker
sudo systemctl enable docker

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# 一度ログアウトして再ログイン（dockerグループ権限を有効化）
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
cd janken-api/awsTest

# または、ローカルからファイルを転送する場合：
# scp -r ./awsTest username@your-vps-ip-address:~/apps/janken-api/
```

## 4. アプリケーションの起動

**これだけです！** ローカル環境と同じ構成でSAM Localを使用します。

```bash
# VPS用の起動スクリプトを実行
./start-vps.sh
```

実行できない場合以下を試します
# ファイルの種類と改行コードを確認
file start-vps.sh

# 改行コードを修正
dos2unix start-vps.sh


起動スクリプトが以下を自動実行します：
- 環境変数の読み込み
- Docker Composeでサービス起動（MySQL、Redis、SAM Local、nginx）
- サービス状態の確認

# 新しいVPS用Express版で起動
docker-compose -f docker-compose.vps.yml up -d --build lambda-local

# ログ確認
docker-compose -f docker-compose.vps.yml logs lambda-local

# 動作確認
sleep 10
curl http://localhost/health



## 5. 動作確認

```bash
# ヘルスチェック
curl http://localhost/health

# APIテスト
curl -X POST http://localhost/test/user \
  -H "Content-Type: application/json" \
  -d '{"userId": "test001"}'

# 手の送信テスト
curl -X POST http://localhost/hand \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1", "hand": "rock"}'
```

## 6. 外部からのアクセス設定（オプション）

外部からアクセスする場合は、ファイアウォールの設定が必要です：

```bash
# UFWファイアウォールの設定
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ファイアウォールの状態確認
sudo ufw status
```

## 7. 管理コマンド

### サービスの状態確認
```bash
cd ~/apps/janken-api/awsTest
docker-compose -f docker-compose.vps.yml ps
```

### ログの確認
```bash
# 全サービスのログ
docker-compose -f docker-compose.vps.yml logs -f

# 特定のサービスのログ
docker-compose -f docker-compose.vps.yml logs -f lambda-local
docker-compose -f docker-compose.vps.yml logs -f mysql
docker-compose -f docker-compose.vps.yml logs -f redis
```

### サービスの停止
```bash
docker-compose -f docker-compose.vps.yml down
```

### サービスの再起動
```bash
docker-compose -f docker-compose.vps.yml restart
```

### 完全な再構築
```bash
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up -d --build
```

## 8. シードデータの投入とUTF-8エンコーディング対応

### 💡 重要：日本語文字化け対策

日本語のニックネームや文字データが正しく表示されるよう、シードデータ投入時には必ず文字エンコーディングを指定してください。

### 8.1 データベース文字セットの確認

```bash
# MySQLコンテナにアクセス
docker-compose -f docker-compose.vps.yml exec mysql mysql -u root -p

# データベースとテーブルの文字セット確認
SHOW CREATE DATABASE jankendb;
SHOW CREATE TABLE users;
SHOW CREATE TABLE user_stats;

# 現在の接続文字セット確認
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

**確認ポイント**:
- データベース: `utf8mb4_unicode_ci`
- テーブル: `utf8mb4_unicode_ci`
- 接続: `utf8mb4`

### 8.2 正しいシードデータ投入方法

```bash
# VPS上で実行 - 必ず文字セットを指定
cd ~/apps/janken-api/awsTest/doc/sql

# 方法1: mysqlコマンドで文字セット指定
mysql -u root -p --default-character-set=utf8mb4 jankendb < seed_users.sql
mysql -u root -p --default-character-set=utf8mb4 jankendb < seed_user_stats.sql  
mysql -u root -p --default-character-set=utf8mb4 jankendb < seed_match_history.sql
mysql -u root -p --default-character-set=utf8mb4 jankendb < seed_daily_ranking.sql

# 方法2: Dockerコンテナ経由（推奨）
# docker execで直接実行（より確実）
docker exec -i awstest-mysql mysql -u root -ppassword --default-character-set=utf8mb4 jankendb < ../doc/sql/seed_users.sql
docker exec -i awstest-mysql mysql -u root -ppassword --default-character-set=utf8mb4 jankendb < ../doc/sql/seed_user_stats.sql
docker exec -i awstest-mysql mysql -u root -ppassword --default-character-set=utf8mb4 jankendb < ../doc/sql/seed_match_history.sql
docker exec -i awstest-mysql mysql -u root -ppassword --default-character-set=utf8mb4 jankendb < ../doc/sql/seed_daily_ranking.sql
```


### 8.3 データの文字化け確認方法

```sql
-- MySQLにログイン後実行
USE jankendb;

-- 文字化けの確認（HEXで確認）
SELECT user_id, nickname, HEX(nickname) AS hex_data FROM users WHERE user_id = 'user025';

-- 正常な場合の「ウィスパー」のHEX値: E382A6E382A3E382B9E38391E383BC
-- 文字化けの場合: C3A3E2809AC2A6... のような値

-- 文字化けしたユーザーを検索
SELECT user_id, nickname FROM users WHERE HEX(nickname) LIKE 'C3A3%';
```

### 8.4 既存データの文字化け修正

文字化けが発生している場合の修正方法：

```sql
-- MySQLに接続して実行
USE jankendb;

-- 接続文字セットを強制設定
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- 具体的な修正例（user025の「ウィスパー」）
UPDATE users SET nickname = 'ウィスパー' WHERE user_id = 'user025';
UPDATE users SET nickname = 'ルミナス' WHERE user_id = 'user035';

-- 修正後の確認
SELECT user_id, nickname, HEX(nickname) FROM users WHERE user_id IN ('user025', 'user035');

-- user_statsテーブルの日本語データも確認・修正
SELECT user_id, title, alias FROM user_stats WHERE user_id = 'user025';
UPDATE user_stats SET alias = '正しい日本語エイリアス' WHERE user_id = 'user025' AND alias LIKE '%文字化け%';
```

### 8.5 予防策：シードファイルの改良

新しいシードファイルの先頭に文字セット設定を追加：

```sql
-- seed_users.sql の先頭に追加
-- 文字セット設定を明示
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

-- 以下、既存のINSERT文...
INSERT INTO users (...) VALUES (...);
```

### 8.6 API側の対応確認

Lambda関数側でも適切なUTF-8設定がされていることを確認：

```javascript
// MySQL接続時の設定例（既に実装済み）
const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'jankendb',
    charset: 'utf8mb4',
    // 以下の設定が重要
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
});

// 接続後の文字セット強制設定
await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
await connection.execute("SET CHARACTER SET utf8mb4");
await connection.execute("SET character_set_connection=utf8mb4");
```

### 8.7 動作確認

```bash
# API経由でのデータ確認
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "user025", "password": "password025"}'

# レスポンスで日本語が正常に表示されることを確認
# 期待値: "nickname": "ウィスパー"
# 問題がある場合: "nickname": "ã‚¦ã‚£ã‚¹ãƒ'ãƒ¼"
```

## 9. トラブルシューティング

### よくある問題

1. **コンテナが起動しない**
   ```bash
   # ログを確認
   docker-compose -f docker-compose.vps.yml logs
   
   # ディスク容量確認
   df -h
   
   # 不要なDockerリソースの削除
   docker system prune -f
   ```

2. **データベース接続エラー**
   ```bash
   # MySQLコンテナの状態確認
   docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -p jankendb
   
   # パスワード: lambda_password
   ```

3. **Redis接続エラー**
   ```bash
   # Redisコンテナの状態確認
   docker-compose -f docker-compose.vps.yml exec redis redis-cli ping
   ```

### 文字エンコーディング関連の問題

1. **日本語が文字化けする**
   ```bash
   # データベースの文字セット確認
   docker-compose -f docker-compose.vps.yml exec mysql mysql -u root -p -e "SHOW VARIABLES LIKE 'character_set%';"
   
   # シードデータを正しい文字セットで再投入
   mysql -u root -p --default-character-set=utf8mb4 jankendb < seed_users.sql
   ```

2. **既存データが文字化けしている**
   ```sql
   -- 文字化けデータの確認
   SELECT user_id, nickname, HEX(nickname) FROM users WHERE HEX(nickname) LIKE 'C3A3%';
   
   -- 個別修正
   UPDATE users SET nickname = '正しい日本語' WHERE user_id = 'ユーザーID';
   ```

3. **API レスポンスが文字化けする**
   ```javascript
   // レスポンスヘッダーの確認
   headers: {
       'Content-Type': 'application/json; charset=utf-8',
       // ... その他のヘッダー
   }
   ```

## 10. ローカル環境との違い

**ほとんど違いはありません！** 主な違いは：

1. **Docker Composeファイル**: `docker-compose.vps.yml`を使用
2. **ポート設定**: 外部アクセス用にポート80を公開
3. **再起動ポリシー**: `restart: unless-stopped`でサービスの自動復旧

## 11. 設定ファイルの説明

### 作成済みファイル一覧
- `docker-compose.vps.yml`: VPS用Docker Compose設定
- `Dockerfile.vps`: SAM Localを含むVPS用Dockerイメージ
- `vps.env`: VPS用環境変数（ローカルと同じ設定）
- `start-vps.sh`: VPS用起動スクリプト

### 環境変数（vps.env）
```bash
# ローカル環境と同じ設定
MYSQL_ROOT_PASSWORD=password
MYSQL_USER=lambda_user
MYSQL_PASSWORD=lambda_password
DB_HOST=awstest-mysql
REDIS_HOST=awstest-redis
```

## 12. セキュリティについて

**注意**: この設定はテスト用途です。本番環境では以下を変更してください：

- データベースパスワードの強化
- SSL証明書の設定
- ファイアウォールルールの詳細設定
- 定期的なバックアップの設定

## まとめ

この手順により、ローカル環境とほぼ同じ構成でVPS上でSAM Localを動作させることができます。

**主な利点**:
- ローカル環境との高い互換性
- SAM Localを使用した本格的なLambda環境
- 簡単なデプロイと管理
- AWS移行時の設定変更が最小限

**アクセスURL**:
- API: `http://your-vps-ip/`
- ヘルスチェック: `http://your-vps-ip/health`
- 直接SAMアクセス: `http://your-vps-ip:3000/` 