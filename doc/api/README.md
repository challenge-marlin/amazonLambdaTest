# API仕様書

## 概要
このドキュメントは、じゃんけんゲームアプリケーションのAPI仕様を定義します。
クライアント（Flutter）とサーバー（Node.js）間の通信インターフェースを明確化し、開発の効率化と品質の向上を図ります。

## ドキュメント構成
- [認証API](auth.md) - ログインなどの認証関連API
- [ユーザーAPI](user.md) - ユーザープロフィールの取得・更新などのユーザー関連API
- [マッチングAPI](match.md) - 対戦マッチングなどのゲーム関連API
- [ランキングAPI](ranking.md) - ランキングデータの取得などのランキング関連API
- [実装状況](status.md) - APIの実装状況と優先度

## 共通仕様

### 基本情報
- ベースURL: `http://localhost:3000/dev/api`（開発環境）
- APIバージョン: v1
- リクエスト形式: JSON
- レスポンス形式: JSON

### リクエストヘッダー
```
Content-Type: application/json
Authorization: Bearer {token}
```

### レスポンス形式
#### 成功時
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  }
}
```

#### エラー時
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "string"
  }
}
```

### エラーコード一覧
- INVALID_REQUEST: リクエストが不正
- UNAUTHORIZED: 認証エラー
- FORBIDDEN: アクセス権限エラー
- NOT_FOUND: リソースが見つからない
- INTERNAL_ERROR: サーバー内部エラー

### ステータスコード
- 200: 成功
- 400: リクエスト不正
- 401: 認証エラー
- 403: アクセス権限エラー
- 404: リソース未検出
- 429: レート制限超過
- 500: サーバーエラー
- 502: バッドゲートウェイ
- 503: サービス利用不可
- 504: ゲートウェイタイムアウト

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

## 環境情報

### エンドポイント情報
```
開発環境:
- ベースURL: http://192.168.1.180:3000/dev/api

AWS環境（予定）:
- ベースURL: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
- 開発環境: https://dev-avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
- ステージング環境: https://stg-avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
- 本番環境: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
```

### リージョン情報
```
リージョン: ap-northeast-3 (大阪)
```

### 注意事項
- 現在は開発環境のエンドポイントを使用しています
- AWS環境への移行時は、API Gatewayのステージ名（proc）は環境によって異なる可能性があります
- リージョンは必要に応じて変更される可能性があります
- エンドポイントは環境変数や設定ファイルで管理することを推奨します
- 本番環境へのデプロイ時は、必ずステージング環境でのテストを実施してください 