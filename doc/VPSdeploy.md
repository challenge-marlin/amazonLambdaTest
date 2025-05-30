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
```

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

起動スクリプトが以下を自動実行します：
- 環境変数の読み込み
- Docker Composeでサービス起動（MySQL、Redis、SAM Local、nginx）
- サービス状態の確認

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

## 8. トラブルシューティング

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

## 9. ローカル環境との違い

**ほとんど違いはありません！** 主な違いは：

1. **Docker Composeファイル**: `docker-compose.vps.yml`を使用
2. **ポート設定**: 外部アクセス用にポート80を公開
3. **再起動ポリシー**: `restart: unless-stopped`でサービスの自動復旧

## 10. 設定ファイルの説明

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

## 11. セキュリティについて

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