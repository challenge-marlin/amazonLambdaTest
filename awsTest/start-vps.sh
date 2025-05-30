#!/bin/bash

echo "=== VPS用SAMアプリケーション起動スクリプト ==="

# 環境変数の読み込み
if [ -f "vps.env" ]; then
    export $(cat vps.env | grep -v '^#' | xargs)
    echo "✓ 環境変数を読み込みました"
else
    echo "⚠ vps.envファイルが見つかりません"
fi

# Docker Composeでサービスを起動
echo "🚀 Docker Composeでサービスを起動中..."
docker-compose -f docker-compose.vps.yml up -d --build

# サービスの状態確認
echo "📊 サービス状態確認中..."
sleep 10
docker-compose -f docker-compose.vps.yml ps

echo ""
echo "=== 起動完了 ==="
echo "🌐 API URL: http://localhost (nginx経由)"
echo "🔧 SAM Local: http://localhost:3000 (直接アクセス)"
echo "📊 ヘルスチェック: curl http://localhost/health"
echo ""
echo "📝 ログ確認: docker-compose -f docker-compose.vps.yml logs -f"
echo "🛑 停止: docker-compose -f docker-compose.vps.yml down" 