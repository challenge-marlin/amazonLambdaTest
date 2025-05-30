#!/bin/bash

echo "=== VPS用Express APIサーバー起動スクリプト ==="

# 環境変数の読み込み
if [ -f "vps.env" ]; then
    export $(cat vps.env | grep -v '^#' | xargs)
    echo "✓ 環境変数を読み込みました"
else
    echo "⚠ vps.envファイルが見つかりません"
fi

# 事前準備: ローカルでnpm installを実行
echo "📦 依存関係の事前インストール..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "🔄 npm installを実行中..."
    npm install
    echo "✓ 依存関係がインストールされました"
else
    echo "✓ node_modulesが既に存在します"
fi

# 古いコンテナとイメージのクリーンアップ
echo "🧹 古いコンテナをクリーンアップ中..."
docker stop awstest-lambda 2>/dev/null || true
docker rm awstest-lambda 2>/dev/null || true
docker rmi awstest-lambda-local 2>/dev/null || true

# Docker Composeでサービスを起動（完全再ビルド）
echo "🚀 Docker Composeでサービスを起動中..."
docker-compose -f docker-compose.vps.yml up -d --build --force-recreate lambda-local

# 他のサービスも確実に起動
echo "🔧 全サービスを起動中..."
docker-compose -f docker-compose.vps.yml up -d

# サービスの状態確認
echo "📊 サービス状態確認中..."
sleep 15
docker-compose -f docker-compose.vps.yml ps

# ログの簡単確認
echo "📝 起動ログ確認..."
docker-compose -f docker-compose.vps.yml logs lambda-local --tail=10

echo ""
echo "=== 起動完了 ==="
echo "🌐 API URL: http://localhost (nginx経由)"
echo "🔧 Express Server: http://localhost:3000 (直接アクセス)"
echo "📊 ヘルスチェック: curl http://localhost/health"
echo "🧪 テストAPI: curl -X POST http://localhost/test/user -H 'Content-Type: application/json' -d '{\"userId\":\"user001\"}'"
echo ""
echo "📝 ログ確認: docker-compose -f docker-compose.vps.yml logs -f lambda-local"
echo "🛑 停止: docker-compose -f docker-compose.vps.yml down" 