# AWS SAM アプリケーション デプロイガイド

このガイドでは、ローカル開発環境からAWS環境へのデプロイ手順を説明します。

## 1. デプロイ前の準備

### 1.1 AWS CLIの設定
```bash
# AWS CLIの設定
aws configure
# 以下の情報を入力
# AWS Access Key ID
# AWS Secret Access Key
# Default region name (例: ap-northeast-1)
# Default output format (json)
```

### 1.2 必要なAWSサービスの有効化
AWSマネジメントコンソールで以下のサービスを有効化してください：
- Amazon RDS
- Amazon ElastiCache
- Amazon S3
- AWS Lambda
- Amazon API Gateway

## 2. インフラストラクチャの準備

### 2.0 VPCとネットワークの設定

#### 2.0.1 VPCの作成
1. AWSコンソールでVPCダッシュボードを開く
2. 「VPCの作成」を選択
3. 推奨設定：
   - VPC名: `your-app-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - テナンシー: デフォルト

#### 2.0.2 サブネットの設定
パブリックサブネット（2つ以上の可用性ゾーン）:
```bash
# 例：
- AZ1: 10.0.1.0/24
- AZ2: 10.0.2.0/24
```

プライベートサブネット（RDSとElastiCache用）:
```bash
# 例：
- AZ1: 10.0.11.0/24
- AZ2: 10.0.12.0/24
```

#### 2.0.3 インターネットゲートウェイの設定
1. インターネットゲートウェイを作成
2. VPCにアタッチ
3. パブリックサブネット用のルートテーブルを作成：
   - `0.0.0.0/0` → インターネットゲートウェイ

#### 2.0.4 NATゲートウェイの設定
1. パブリックサブネットにNATゲートウェイを作成
2. プライベートサブネット用のルートテーブルを作成：
   - `0.0.0.0/0` → NATゲートウェイ

#### 2.0.5 セキュリティグループの設定

1. Lambda関数用セキュリティグループ:
```bash
名前: lambda-sg
インバウンド: なし
アウトバウンド:
- MySQL (3306) → RDS-SG
- Redis (6379) → Redis-SG
- HTTPS (443) → 0.0.0.0/0（外部API用）
```

2. RDS用セキュリティグループ:
```bash
名前: rds-sg
インバウンド:
- MySQL (3306) ← Lambda-SG
アウトバウンド: すべて許可
```

3. ElastiCache用セキュリティグループ:
```bash
名前: redis-sg
インバウンド:
- Redis (6379) ← Lambda-SG
アウトバウンド: すべて許可
```

#### 2.0.6 サブネットグループの作成

1. RDSサブネットグループ:
   - 名前: `rds-subnet-group`
   - VPC: 作成したVPC
   - サブネット: プライベートサブネット（2つ以上）

2. ElastiCacheサブネットグループ:
   - 名前: `redis-subnet-group`
   - VPC: 作成したVPC
   - サブネット: プライベートサブネット（2つ以上）

### 2.1 Amazon RDS (MySQL) の設定
1. RDSコンソールで新しいDBインスタンスを作成
2. 以下の設定を推奨：
   - エンジン: MySQL 8.0
   - インスタンスクラス: db.t3.micro (開発環境)
   - ストレージ: 20GB
   - マルチAZ: 開発環境では不要
   - VPC: 作成したVPC
   - サブネットグループ: `rds-subnet-group`
   - パブリックアクセス: いいえ
   - セキュリティグループ: `rds-sg`
   - データベースポート: 3306

3. データベースの初期化
```sql
CREATE DATABASE userdb;
USE userdb;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Amazon ElastiCache (Redis) の設定
1. ElastiCacheコンソールで新しいクラスターを作成
2. 推奨設定：
   - エンジン: Redis
   - クラスター: クラスター無効化
   - ノードタイプ: cache.t3.micro
   - VPC: 作成したVPC
   - サブネットグループ: `redis-subnet-group`
   - セキュリティグループ: `redis-sg`
   - ポート: 6379

### 2.3 S3バケットの作成
```bash
# バケットの作成
aws s3 mb s3://your-app-name-deployment-bucket --region ap-northeast-1
```

## 3. 環境変数の更新

`template.yaml`の環境変数を本番環境用に更新：

```yaml
Environment:
  Variables:
    DB_HOST: your-rds-endpoint.region.rds.amazonaws.com
    DB_USER: admin
    DB_PASSWORD: your-secure-password
    DB_NAME: userdb
    REDIS_HOST: your-elasticache-endpoint.region.cache.amazonaws.com
    REDIS_PORT: 6379
    REDIS_PASSWORD: ""
```

## 4. SAMアプリケーションのデプロイ

### 4.1 ビルド
```bash
# アプリケーションのビルド
sam build
```

### 4.2 デプロイ
```bash
# 初回デプロイ
sam deploy --guided

# 以下の情報を入力
# Stack Name: user-management-api
# AWS Region: ap-northeast-1
# Confirm changes before deploy: yes
# Allow SAM CLI IAM role creation: yes
# Save arguments to configuration file: yes
# SAM configuration file: samconfig.toml
# SAM configuration environment: default
```

### 4.3 デプロイの確認
```bash
# スタックの状態確認
aws cloudformation describe-stacks --stack-name user-management-api

# API Gatewayのエンドポイント確認
aws cloudformation describe-stacks --stack-name user-management-api --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text
```

## 5. テスト

### 5.1 APIエンドポイントのテスト
```bash
# ユーザー作成のテスト
curl -X POST https://your-api-id.execute-api.region.amazonaws.com/Prod/users \
  -H "Content-Type: application/json" \
  -d '{"name":"テストユーザー","email":"test@example.com"}'

# ユーザー取得のテスト
curl https://your-api-id.execute-api.region.amazonaws.com/Prod/users/1
```

## 6. トラブルシューティング

### 6.1 一般的な問題
1. デプロイエラー
   - CloudFormationスタックの状態を確認
   - IAMロールの権限を確認
   - リソースの制限に達していないか確認

2. 接続エラー
   - セキュリティグループの設定を確認
   - VPCの設定を確認
   - エンドポイントの接続性を確認

3. パフォーマンス問題
   - Lambda関数のメモリ設定を確認
   - RDSのインスタンスサイズを確認
   - ElastiCacheのノードタイプを確認

### 6.2 ログの確認
```bash
# Lambda関数のログを確認
aws logs get-log-events --log-group-name /aws/lambda/your-function-name

# API Gatewayのログを確認
aws logs get-log-events --log-group-name /aws/apigateway/your-api-name
```

## 7. クリーンアップ

不要になったリソースを削除する場合：

```bash
# SAMアプリケーションの削除
sam delete

# 手動で作成したリソースの削除
# - RDSインスタンス
# - ElastiCacheクラスター
# - S3バケット
```

## 8. セキュリティのベストプラクティス

1. 本番環境では必ず以下の設定を行う：
   - RDSの暗号化を有効化
   - ElastiCacheの暗号化を有効化
   - API Gatewayの認証を設定
   - 適切なIAMロールとポリシーの設定

2. 環境変数の管理：
   - 機密情報はAWS Systems Manager Parameter Storeを使用
   - 本番環境の認証情報は定期的にローテーション

3. モニタリングの設定：
   - CloudWatchアラームの設定
   - パフォーマンスメトリクスの監視
   - エラーレートの監視
