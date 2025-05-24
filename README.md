# じゃんけんゲーム バックエンドAPI

このプロジェクトは、AWS SAMを使用したサーバーレスアプリケーションです。じゃんけんゲームのバックエンドAPIを提供し、ユーザー管理、対戦管理、ランキング機能などを実装しています。

## システム構成

### アーキテクチャ概要

本システムは以下のAWSサービスを使用したサーバーレスアーキテクチャを採用しています：

- AWS Lambda: アプリケーションロジックの実行
- Amazon API Gateway: RESTful APIエンドポイントの提供
- Amazon RDS (MySQL): ユーザーデータの永続化
- Amazon ElastiCache (Redis): セッション管理とキャッシュ
- Amazon VPC: ネットワークの分離と制御
- AWS SAM: インフラストラクチャのコード化とデプロイ

### システム要件

- Node.js 18.x
- MySQL 8.0
- Redis 6.x

### インフラストラクチャ構成

```
VPC
├── パブリックサブネット (2AZ)
│   └── NAT Gateway
└── プライベートサブネット (2AZ)
    ├── Lambda Functions
    ├── RDS (MySQL)
    └── ElastiCache (Redis)
```

## プロジェクト構造

```
.
├── awsTest/                   # SAMアプリケーション
├── doc/                      # プロジェクトドキュメント
│   ├── DB仕様書.md
│   ├── sql/                 # データベース関連SQL
│   │   ├── create_tables.sql    # テーブル定義
│   │   ├── seed_base.sql       # 基本サンプルデータ
│   │   ├── seed_users.sql      # ユーザーデータ
│   │   ├── seed_user_stats.sql # ユーザー統計データ
│   │   ├── seed_match_history.sql # 対戦履歴データ
│   │   └── seed_daily_ranking.sql # ランキングデータ
│   └── deploy.md           # デプロイ手順詳細
├── infra/                    # インフラ構成コード
│   └── terraform/           # Terraform設定（予定）
└── README.md                # 本ファイル
```

## データベースのセットアップ

### テーブル作成

```bash
# MySQLに接続
mysql -h <HOST> -u <USER> -p<PASSWORD> <DATABASE>

# テーブル作成
source doc/sql/create_tables.sql
```

### テストデータの投入

テストデータは以下の順序で投入してください：

1. 基本データ
```bash
source doc/sql/seed_base.sql
```

2. ユーザーデータ
```bash
source doc/sql/seed_users.sql
```

3. ユーザー統計データ
```bash
source doc/sql/seed_user_stats.sql
```

4. 対戦履歴データ
```bash
source doc/sql/seed_match_history.sql
```

5. ランキングデータ
```bash
source doc/sql/seed_daily_ranking.sql
```

各SQLファイルの役割：
- `create_tables.sql`: データベースのテーブル定義
- `seed_base.sql`: 基本的なサンプルデータ（管理者、テストユーザーなど）
- `seed_users.sql`: 本番を想定したユーザーデータ
- `seed_user_stats.sql`: ユーザーの戦績や統計情報
- `seed_match_history.sql`: じゃんけん対戦の履歴データ
- `seed_daily_ranking.sql`: デイリーランキングデータ

## 開発環境のセットアップ

1. 必要なツールのインストール
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# AWS SAM CLI
pip install aws-sam-cli

# Node.js 18.x
# Windowsの場合は公式サイトからインストーラーをダウンロード
```

2. AWS認証情報の設定
```bash
aws configure
# AWS Access Key ID
# AWS Secret Access Key
# Default region name (例: ap-northeast-1)
# Default output format (json)
```

3. SAMアプリケーションの開発
```bash
cd awsTest
# 詳細は awsTest/README.md を参照
```

## デプロイ

デプロイの詳細な手順については [doc/deploy.md](doc/deploy.md) を参照してください。

### クイックデプロイ

```bash
# ビルド
sam build

# デプロイ（初回）
sam deploy --guided

# 2回目以降のデプロイ
sam deploy
```

## 環境構築の注意点

1. VPCエンドポイントの設定
   - S3
   - DynamoDB
   - ECR
   - CloudWatch Logs

2. セキュリティグループの設定
   - Lambda → RDS (3306)
   - Lambda → ElastiCache (6379)
   - Lambda → インターネット (443)

3. IAMロールとポリシー
   - Lambda実行ロール
   - RDSアクセスロール
   - CloudWatchロギングロール

## 運用管理

### モニタリング

- CloudWatch Metricsによる監視
- CloudWatch Logsによるログ収集
- X-Rayによるトレース

### バックアップ

- RDS自動バックアップ
- ElastiCacheスナップショット
- S3バージョニング

### セキュリティ

- SSL/TLS通信の強制
- セキュリティグループの最小権限設定
- IAMロールの最小権限設定
- 機密情報のParameter Store管理

## 開発ガイドライン

- [awsTest/README.md](awsTest/README.md) - SAMアプリケーション開発ガイド
- [doc/DB仕様書.md](doc/DB仕様書.md) - データベース設計書
- [doc/deploy.md](doc/deploy.md) - デプロイ手順書 