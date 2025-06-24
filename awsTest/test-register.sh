#!/bin/bash

# テストユーザーの登録
echo "🔷 テストユーザーの登録を開始..."
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "test123",
      "email": "test@example.com",
      "password": "test123!",
      "name": "Test User",
      "nickname": "Tester",
      "profileImageUrl": "https://example.com/default.jpg",
      "studentIdImageUrl": "https://example.com/student.jpg"
    }
  }'
echo -e "\n"

# 登録したユーザーでログイン
echo "🔷 登録したユーザーでログインを試行..."
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "password": "test123!"
  }'
echo -e "\n"

# データベースの確認
echo "🔷 データベースの状態を確認..."
docker exec awstest-mysql mysql -ulambda_user -plambda_password jankendb -e "SELECT user_id, email, name, nickname FROM users WHERE user_id = 'test123';"
docker exec awstest-mysql mysql -ulambda_user -plambda_password jankendb -e "SELECT management_code, title, alias FROM user_stats WHERE management_code = (SELECT management_code FROM users WHERE user_id = 'test123');" 