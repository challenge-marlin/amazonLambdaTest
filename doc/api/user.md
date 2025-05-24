# ユーザーAPI

## 1. ユーザープロフィール取得

### エンドポイント
```
GET /api/user
```

### リクエスト
- userId: クエリパラメータ（ユーザーID）

### レスポンス（成功時）
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "string",
      "nickname": "string",
      "name": "string",
      "email": "string",
      "profileImageUrl": "string",
      "title": "string",
      "alias": "string",
      "university": "string",
      "postalCode": "string",
      "address": "string",
      "phoneNumber": "string",
      "isStudentIdEditable": boolean,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": "string"
  }
}
```

### エラーケース
1. 認証エラー
   - コード: UNAUTHORIZED
   - メッセージ: "認証に失敗しました"

2. リソース未検出
   - コード: NOT_FOUND
   - メッセージ: "指定されたユーザーが見つかりません"

3. サーバーエラー
   - コード: INTERNAL_ERROR
   - メッセージ: "サーバーエラーが発生しました"

## 2. ユーザーステータス取得

### エンドポイント
```
GET /api/user-stats/{userId}
```

### リクエスト
- userId: パスパラメータ（ユーザーID）

### レスポンス（成功時）
```json
{
  "success": true,
  "data": {
    "stats": {
      "userId": "string",
      "showTitle": boolean,
      "showAlias": boolean,
      "winCount": number,
      "loseCount": number,
      "drawCount": number,
      "totalMatches": number,
      "dailyWins": number,
      "dailyRank": "string",
      "dailyRanking": number,
      "recentHandResultsStr": "string",  // 例："G:W,P:D,S:L"（グー勝ち、パーあいこ、チョキ負け）
      "title": "string",                 // 現在の称号
      "availableTitles": "string",       // 利用可能な称号（カンマ区切り）
      "alias": "string",                 // 現在の二つ名
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": "string"
  }
}
```

### エラーケース
1. 認証エラー
   - コード: UNAUTHORIZED
   - メッセージ: "認証に失敗しました"

2. リソース未検出
   - コード: NOT_FOUND
   - メッセージ: "指定されたユーザーが見つかりません"
   - 注: 新規ユーザーの場合は自動的にステータスが作成されます

3. サーバーエラー
   - コード: INTERNAL_ERROR
   - メッセージ: "サーバーエラーが発生しました"

## 3. ユーザー情報更新

### エンドポイント
```
PUT /api/user
```

### リクエスト
```json
{
  "name": "string",
  "nickname": "string",
  "email": "string",
  "university": "string",
  "postalCode": "string",
  "address": "string",
  "phoneNumber": "string"
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "string",
      "nickname": "string",
      "name": "string",
      "email": "string",
      "profileImageUrl": "string",
      "title": "string",
      "alias": "string",
      "university": "string",
      "postalCode": "string",
      "address": "string",
      "phoneNumber": "string",
      "isStudentIdEditable": boolean,
      "updatedAt": "string"
    }
  }
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": "string"
  }
}
```

### エラーケース
1. バリデーションエラー
   - コード: INVALID_REQUEST
   - メッセージ: "入力値が不正です"

2. 認証エラー
   - コード: UNAUTHORIZED
   - メッセージ: "認証に失敗しました"

3. リソース未検出
   - コード: NOT_FOUND
   - メッセージ: "指定されたユーザーが見つかりません"

4. サーバーエラー
   - コード: INTERNAL_ERROR
   - メッセージ: "サーバーエラーが発生しました"

## 4. ユーザーステータス更新

### エンドポイント
```
PUT /api/user-stats/{userId}
```

### リクエスト
```json
{
  "title": "string",    // 称号（オプション）
  "alias": "string"     // 二つ名（オプション）
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "data": {
    "stats": {
      "userId": "string",
      "title": "string",
      "alias": "string",
      "updatedAt": "string"
    }
  }
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": "string"
  }
}
```

### エラーケース
1. バリデーションエラー
   - コード: INVALID_REQUEST
   - メッセージ: "入力値が不正です"

2. 認証エラー
   - コード: UNAUTHORIZED
   - メッセージ: "認証に失敗しました"

3. リソース未検出
   - コード: NOT_FOUND
   - メッセージ: "指定されたユーザーが見つかりません"
   - 注: 新規ユーザーの場合は自動的にステータスが作成されます

4. サーバーエラー
   - コード: INTERNAL_ERROR
   - メッセージ: "サーバーエラーが発生しました"

## 5. プロフィール画像アップロード

### エンドポイント
```
POST /api/user/profile-image
```

### リクエスト
- Content-Type: multipart/form-data
- file: 画像ファイル（最大サイズ: 5MB）

### レスポンス（成功時）
```json
{
  "success": true,
  "data": {
    "profileImageUrl": "string"
  }
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたユーザーが見つかりません",
    "details": "string"
  }
}
```

### エラーケース
1. ファイルサイズ超過
   - コード: INVALID_REQUEST
   - メッセージ: "ファイルサイズが大きすぎます"

2. 不正なファイル形式
   - コード: INVALID_REQUEST
   - メッセージ: "不正なファイル形式です"

3. 認証エラー
   - コード: UNAUTHORIZED
   - メッセージ: "認証に失敗しました"

4. リソース未検出
   - コード: NOT_FOUND
   - メッセージ: "指定されたユーザーが見つかりません"

5. サーバーエラー
   - コード: INTERNAL_ERROR
   - メッセージ: "サーバーエラーが発生しました"

## 共通仕様

### 認証
- 認証は不要です
- ユーザーIDのみでアクセス可能です

### エラーコード一覧
- INVALID_REQUEST: リクエストが不正
- NOT_FOUND: リソースが見つからない
- INTERNAL_ERROR: サーバー内部エラー

### 日時形式
- すべての日時は ISO 8601形式（YYYY-MM-DDTHH:mm:ss.sssZ）で返されます

### ページネーション
- リストを返すAPIでは、以下のパラメータをサポートします
  - page: ページ番号（1から始まる）
  - limit: 1ページあたりの件数（デフォルト: 20）
- レスポンスには以下のメタ情報が含まれます
  - total: 総件数
  - page: 現在のページ番号
  - limit: 1ページあたりの件数
  - hasMore: 次のページの有無 