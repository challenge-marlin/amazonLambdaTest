# VPSデプロイ手順書 - じゃんけんゲームAPI

このドキュメントは、じゃんけんゲームAPIのVPS（Virtual Private Server）デプロイ手順を説明します。

## 環境情報

### 現在の環境
```
VPS環境（本番）:
- ベースURL: http://160.251.137.105/
- ヘルスチェック: http://160.251.137.105/health
- 直接SAMアクセス: http://160.251.137.105:3000/

開発環境（ローカル）:
- ベースURL: http://192.168.1.180:3000/dev/api

AWS環境（予定）:
- ベースURL: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
```

### 環境ごとの特徴
| 環境 | 認証 | 通信 | 実装 | 備考 |
|------|------|------|------|------|
| VPS | APIキー不要 | HTTP | Express.js | 現在の本番環境 |
| 開発 | APIキー不要 | HTTP | Express.js | ローカル開発用 |
| AWS | APIキー必須 | HTTPS | API Gateway | 将来の本番環境 |

## デプロイ手順

### 1. VPSへのSSHログイン
```bash
ssh -i "path/to/your/key.pem" username@160.251.137.105
```

### 2. 必要なソフトウェアのインストール
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
```

### 3. アプリケーションの起動
```bash
# VPS用の起動スクリプトを実行
./start-vps.sh

# または直接Docker Composeで起動
docker-compose -f docker-compose.vps.yml up -d --build lambda-local
docker-compose -f docker-compose.vps.yml up -d
```

### 4. 動作確認
```bash
# ヘルスチェック
curl http://localhost/health

# APIテスト
curl -X POST http://localhost/UserInfo \
  -H "Content-Type: application/json" \
  -d '{"userId": "test001"}'
```

## 管理コマンド

### フォルダ移動
```bash
cd /home/lambda_user/apps/awsTest/
```

### サービスの状態確認
```bash
docker-compose -f docker-compose.vps.yml ps
```

### ログの確認
```bash
# 全サービスのログ
docker-compose -f docker-compose.vps.yml logs -f
docker-compose -f docker-compose.vps.yml logs lambda-local --tail=10

# 特定のサービスのログ
docker-compose -f docker-compose.vps.yml logs -f lambda-local
```

# 同時に別ターミナルでリアルタイムログ監視
```bash
docker-compose -f docker-compose.vps.yml logs -f lambda-local
```

### サービスの再起動
```bash
# 再起動

docker-compose -f docker-compose.vps.yml restart lambda-local

# 完全な再構築
docker-compose -f docker-compose.vps.yml down
docker-compose -f docker-compose.vps.yml up -d --build


```

## データベース管理

### データベースの再構成
```bash
# データベースの存在確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password -e "SHOW DATABASES;"

# テーブル一覧の確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SHOW TABLES;"

# データベースが存在しない、またはテーブルの再構築が必要な場合
# 1. データベースの再作成
docker-compose -f docker-compose.vps.yml down -v  # -v オプションでボリュームも削除
docker-compose -f docker-compose.vps.yml up -d    # コンテナを再作成（初期化SQLが実行される）


# 2. データベースとテーブルが作成されたことを確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password -e "SHOW DATABASES; USE jankendb; SHOW TABLES;"
```

### テーブル構造の確認と変更
```bash
# テーブル一覧の確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SHOW TABLES;"

# テーブル構造の詳細確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SHOW CREATE TABLE テーブル名;"
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "DESC テーブル名;"

# カラムの追加
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "ALTER TABLE テーブル名 ADD COLUMN カラム名 データ型 DEFAULT デフォルト値 AFTER 既存カラム名;"

# カラムの変更
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "ALTER TABLE テーブル名 MODIFY COLUMN カラム名 新しいデータ型;"

# カラムの削除
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "ALTER TABLE テーブル名 DROP COLUMN カラム名;"
```

### データの確認と操作
```bash
# テーブルの全データ確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SELECT * FROM テーブル名;"

# usersテーブルの中身を少し確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SELECT user_id, nickname, register_type, created_at FROM users LIMIT 5;"


# 特定の条件でデータを確認
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "SELECT * FROM テーブル名 WHERE 条件;"

# データの更新
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "UPDATE テーブル名 SET カラム名 = 値 WHERE 条件;"

# データの削除
docker-compose -f docker-compose.vps.yml exec mysql mysql -u lambda_user -plambda_password jankendb -e "DELETE FROM テーブル名 WHERE 条件;"
```

### シードデータの投入
```bash
# シードデータの投入（順序を守ることが重要）
docker exec -i awstest-mysql mysql -u root -proot jankendb < doc/sql/seed_users.sql
docker exec -i awstest-mysql mysql -u root -proot jankendb < ../doc/sql/seed_users.sql
docker exec -i awstest-mysql mysql -u root -proot jankendb < doc/sql/seed_user_stats.sql
docker exec -i awstest-mysql mysql -u root -proot jankendb < doc/sql/seed_daily_ranking.sql
docker exec -i awstest-mysql mysql -u root -proot jankendb < doc/sql/seed_match_history.sql

# シードデータが正しく投入されたことを確認
docker exec -i awstest-mysql mysql -u root -proot jankendb -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM user_stats;"

```

### 文字エンコーディング確認
```