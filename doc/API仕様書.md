# API仕様書

## AWS環境情報

### エンドポイント情報
```
ベースURL: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc

環境ごとのエンドポイント:
- 開発環境: https://dev-avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
- ステージング環境: https://stg-avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
- 本番環境: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
```

### リージョン情報
```
リージョン: ap-northeast-3 (大阪)
```

### エンドポイント構造
```
{環境}-{API ID}.execute-api.{リージョン}.amazonaws.com/{ステージ}/{リソースパス}
```

### 注意事項
- API Gatewayのステージ名（proc）は環境によって異なる可能性があります
- リージョンは必要に応じて変更される可能性があります
- エンドポイントは環境変数や設定ファイルで管理することを推奨します
- 本番環境へのデプロイ時は、必ずステージング環境でのテストを実施してください

### セキュリティ要件
- すべての通信はHTTPSで行われます
- API Gatewayの認証はAPIキーを使用します
- リクエストヘッダーに`x-api-key`を必須とします

### エラーレスポンス（AWS環境）
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "error": {
    "code": "エラーコード",
    "details": "エラー詳細（開発環境のみ）"
  }
}
```

### ステータスコード（AWS環境）
- 200: 成功
- 400: リクエスト不正
- 401: 認証エラー（APIキー不正）
- 403: アクセス権限エラー
- 404: リソース未検出
- 429: レート制限超過
- 500: サーバーエラー
- 502: バッドゲートウェイ
- 503: サービス利用不可
- 504: ゲートウェイタイムアウト

## 概要
このドキュメントは、じゃんけんゲームアプリケーションのAPI仕様を定義します。
クライアント（Flutter）とサーバー（Node.js）間の通信インターフェースを明確化し、開発の効率化と品質の向上を図ります。

## 共通仕様

### 基本情報
- ベースURL: `http://localhost:3000/dev/api`
- リクエスト形式: JSON
- レスポンス形式: JSON

### エラーレスポンス
```json
{
  "success": false,
  "message": "エラーメッセージ",
  "error": "エラー詳細（開発環境のみ）"
}
```

### ステータスコード
- 200: 成功
- 400: リクエスト不正
- 401: 認証エラー
- 404: リソース未検出
- 500: サーバーエラー

## 認証API

### ログイン

#### エンドポイント
```
POST /UserInfo
```

#### リクエストヘッダー
```
Content-Type: application/json
x-api-key: {APIキー}
```

#### リクエスト
```json
{
  "userId": "string",    // ユーザーID
  "password": "string"   // パスワード
}
```

#### レスポンス（成功時）
```json
{
  "success": true,
  "user": {
    "user_id": "string",           // ユーザーID
    "nickname": "string",          // ニックネーム
    "title": "string",             // 称号
    "alias": "string",             // 二つ名
    "profile_image_url": "string"  // プロフィール画像URL
  }
}
```

#### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "ユーザーIDまたはパスワードが正しくありません",
  "error": {
    "code": "AUTH_ERROR",
    "details": "認証に失敗しました"
  }
}
```

#### エラーケース
1. APIキー未設定
   - ステータスコード: 401
   - メッセージ: "APIキーが設定されていません"

2. 必須パラメータ不足
   - ステータスコード: 400
   - メッセージ: "ユーザーIDとパスワードは必須です"

3. 認証失敗
   - ステータスコード: 401
   - メッセージ: "ユーザーIDまたはパスワードが正しくありません"

4. レート制限超過
   - ステータスコード: 429
   - メッセージ: "リクエスト制限を超過しました"

5. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "ログイン処理中にエラーが発生しました"

#### セキュリティ要件
- パスワードはハッシュ化して保存
- HTTPS通信必須
- APIキーによる認証必須
- レート制限の適用

#### 実装例

##### クライアント側（Flutter）
```dart
final response = await http.post(
  Uri.parse('$baseUrl/UserInfo'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: jsonEncode({
    'userId': userId,
    'password': password,
  }),
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  if (data['success']) {
    // ログイン成功時の処理
    final user = data['user'];
    // 画面遷移など
  } else {
    // エラーメッセージの表示
    showErrorMessage(data['message']);
  }
} else if (response.statusCode == 429) {
  // レート制限超過時の処理
  showRateLimitError();
}
```

##### サーバー側（Node.js）
```javascript
app.post('/dev/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'ユーザーIDとパスワードは必須です'
      });
    }

    // ユーザー認証処理
    const user = await authenticateUser(userId, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ユーザーIDまたはパスワードが正しくありません'
      });
    }

    // ログイン成功
    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        nickname: user.nickname,
        title: user.title,
        alias: user.alias,
        profile_image_url: user.profile_image_url
      }
    });
  } catch (error) {
    console.error('ログイン処理エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ログイン処理中にエラーが発生しました'
    });
  }
});
```

## ユーザーAPI

### プロフィール取得

#### エンドポイント
```
GET /UserInfo/{userId}
```

#### リクエストヘッダー
```
Content-Type: application/json
x-api-key: {APIキー}
```

#### リクエストパラメータ
- userId: ユーザーID（パスパラメータ）

#### レスポンス（成功時）
```json
{
  "success": true,
  "user": {
    "user_id": "string",           // ユーザーID
    "nickname": "string",          // ニックネーム
    "title": "string",             // 称号
    "alias": "string",             // 二つ名
    "profile_image_url": "string", // プロフィール画像URL
    "win_count": number,           // 勝利数
    "today_rank": "string",        // 本日ランク
    "today_position": "string"     // 本日順位
  }
}
```

#### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "プロフィールの取得に失敗しました",
  "error": {
    "code": "PROFILE_ERROR",
    "details": "ユーザーが見つかりません"
  }
}
```

#### エラーケース
1. APIキー未設定
   - ステータスコード: 401
   - メッセージ: "APIキーが設定されていません"

2. ユーザーID未指定
   - ステータスコード: 400
   - メッセージ: "ユーザーIDは必須です"

3. ユーザー未検出
   - ステータスコード: 404
   - メッセージ: "指定されたユーザーが見つかりません"

4. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "プロフィールの取得中にエラーが発生しました"

## マッチングAPI

### マッチング状態確認

#### エンドポイント
```
GET /match
```

#### リクエストヘッダー
```
Content-Type: application/json
x-api-key: {APIキー}
```

#### リクエストパラメータ
- userId: ユーザーID（クエリパラメータ）

#### レスポンス（成功時）
```json
{
  "success": true,
  "id": "string",           // マッチングID
  "player1_id": "string",   // プレイヤー1のID
  "player2_id": "string",   // プレイヤー2のID
  "player1_hand": "string", // プレイヤー1の手（グー/チョキ/パー）
  "player2_hand": "string", // プレイヤー2の手（グー/チョキ/パー）
  "result": {
    "player1_result": "string", // プレイヤー1の結果（勝ち/負け/引き分け）
    "player2_result": "string"  // プレイヤー2の結果（勝ち/負け/引き分け）
  }
}
```

#### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "マッチング状態の取得に失敗しました",
  "error": {
    "code": "MATCH_ERROR",
    "details": "マッチングが見つかりません"
  }
}
```

### 手の送信

#### エンドポイント
```
POST /match/hand
```

#### リクエストヘッダー
```
Content-Type: application/json
x-api-key: {APIキー}
```

#### リクエスト
```json
{
  "userId": "string",      // ユーザーID
  "matchingId": "string",  // マッチングID
  "hand": "string"         // 手（グー/チョキ/パー）
}
```

#### レスポンス（成功時）
```json
{
  "success": true,
  "message": "手を送信しました"
}
```

#### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "手の送信に失敗しました",
  "error": {
    "code": "HAND_ERROR",
    "details": "無効な手です"
  }
}
```

#### エラーケース
1. APIキー未設定
   - ステータスコード: 401
   - メッセージ: "APIキーが設定されていません"

2. 必須パラメータ不足
   - ステータスコード: 400
   - メッセージ: "ユーザーID、マッチングID、手は必須です"

3. 無効な手
   - ステータスコード: 400
   - メッセージ: "無効な手です（グー/チョキ/パーのいずれかを指定してください）"

4. マッチング未検出
   - ステータスコード: 404
   - メッセージ: "指定されたマッチングが見つかりません"

5. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "手の送信中にエラーが発生しました" 