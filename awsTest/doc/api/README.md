# API仕様書

## 概要
このドキュメントは、じゃんけんゲームアプリケーションのAPI仕様を定義します。
クライアント（Flutter）とサーバー（Node.js）間の通信インターフェースを明確化し、開発の効率化と品質の向上を図ります。

## API設計方針

### 画面単位でのAPI分離原則
本プロジェクトでは、**画面単位でのAPI分離**を基本方針とします：

1. **画面専用API**: 各画面（ロビー、設定、バトル等）には専用のAPIエンドポイントを用意
2. **機能横断の禁止**: あるAPIの修正が他画面に影響することを防ぐため、APIの機能横断的な使用は禁止
3. **代替案の回避**: クライアントが既存APIの組み合わせで代替実装することは避け、必要な機能は専用APIとして実装
4. **独立性の保証**: 各画面のAPIは独立して動作し、他画面のAPIに依存しない設計

### 実装責任
- **サーバーサイド**: 画面ごとに必要な専用APIを実装する責任
- **クライアントサイド**: 画面に対応する専用APIのみを使用する責任

### API命名規則
```
/api/{画面名}/{機能名}/{パラメータ}
```

例：
- `/api/lobby/user-stats/{userId}` - ロビー画面専用のユーザーステータス取得
- `/api/settings/user-profile/{userId}` - 設定画面専用のユーザープロフィール取得
- `/api/battle/hand` - バトル画面専用の手送信

この方針により、各画面の機能が独立し、保守性と安定性を確保します。

## 環境ごとの仕様

### VPS環境（現在の本番環境）
- ベースURL: `http://160.251.137.105/`
- APIキー認証: 不要
- 通信: HTTP
- 実装: Express.js
- 備考: テスト用環境

### 開発環境（ローカル）
- ベースURL: `http://192.168.1.180:3000/`
- APIキー認証: 不要
- 通信: HTTP
- 実装: Express.js
- 備考: ローカル開発用

### AWS環境（予定）
- ベースURL: `https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc`
- APIキー認証: 必須
- 通信: HTTPS
- 実装: API Gateway
- 備考: 本番環境用

## 共通仕様

### 基本情報
- リクエスト形式: JSON
- レスポンス形式: JSON

### リクエストヘッダー
```
Content-Type: application/json
x-api-key: {APIキー}  # AWS環境でのみ必須
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

## 主要APIエンドポイント

### 認証API
- `POST /UserInfo` - ログイン
  - リクエスト:
    ```json
    {
      "userId": "string",
      "password": "string"
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "userId": "string",
        "nickname": "string",
        "token": "string"
      }
    }
    ```

- `GET /UserInfo/{userId}` - ユーザープロフィール取得
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "userId": "string",
        "nickname": "string",
        "profileImageUrl": "string",
        "title": "string",
        "alias": "string"
      }
    }
    ```

### バトル画面API（画面専用）
- `GET /battle` - マッチング状態確認（バトル画面専用）
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "id": "string",
        "status": "string",
        "player1_id": "string",
        "player2_id": "string",
        "player1_ready": boolean,
        "player2_ready": boolean
      }
    }
    ```

- `POST /battle` - マッチング開始（バトル画面専用）
  - リクエスト:
    ```json
    {
      "userId": "string"
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "matchingId": "string",
        "status": "waiting"
      }
    }
    ```

- `POST /battle/hand` - 手の送信（バトル画面専用）
  - リクエスト:
    ```json
    {
      "userId": "string",
      "matchingId": "string",
      "hand": "string"
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "message": "手を送信しました",
        "status": "string"
      }
    }
    ```

- `POST /battle/judge` - 結果判定（バトル画面専用）
  - リクエスト:
    ```json
    {
      "matchingId": "string"
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "result": {
          "winner": number,
          "is_draw": boolean,
          "is_finished": boolean
        }
      }
    }
    ```

- `POST /battle/ready` - 準備完了（バトル画面専用）
- `POST /battle/quit` - マッチ辞退（バトル画面専用）
- `POST /battle/reset_hands` - 手のリセット（バトル画面専用）

### ロビー画面API
- `GET /api/lobby/user-stats/{userId}` - ロビー用ユーザーステータス取得（ロビー画面専用）
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "stats": {
          "userId": "string",
          "nickname": "string",
          "profileImageUrl": "string",
          "showTitle": boolean,
          "showAlias": boolean,
          "winCount": number,
          "loseCount": number,
          "drawCount": number,
          "totalMatches": number,
          "dailyWins": number,
          "dailyRank": "string",
          "dailyRanking": number,
          "recentHandResultsStr": "string",
          "title": "string",
          "availableTitles": "string",
          "alias": "string"
        }
      }
    }
    ```

- `PUT /api/lobby/user-stats/{userId}/title-alias` - 称号・二つ名更新（ロビー画面専用）
  - リクエスト:
    ```json
    {
      "title": "string",
      "alias": "string"
    }
    ```
  - レスポンス:
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

- `PUT /api/lobby/user-stats/{userId}/display` - 表示設定更新（ロビー画面専用）
  - リクエスト:
    ```json
    {
      "showTitle": boolean,
      "showAlias": boolean
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "stats": {
          "userId": "string",
          "showTitle": boolean,
          "showAlias": boolean,
          "updatedAt": "string"
        }
      }
    }
    ```

### 設定画面API
- `GET /api/settings/user-profile/{userId}` - 設定画面用ユーザープロフィール取得（設定画面専用）
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "profile": {
          "userId": "string",
          "nickname": "string",
          "name": "string",
          "email": "string",
          "profileImageUrl": "string",
          "studentIdImageUrl": "string",
          "title": "string",
          "alias": "string",
          "availableTitles": "string",
          "university": "string",
          "postalCode": "string",
          "address": "string",
          "phoneNumber": "string",
          "isStudentIdEditable": boolean,
          "showTitle": boolean,
          "showAlias": boolean,
          "createdAt": "string",
          "updatedAt": "string"
        }
      }
    }
    ```

- `PUT /api/settings/user-profile/{userId}` - ユーザープロフィール更新（設定画面専用）
  - リクエスト:
    ```json
    {
      "nickname": "string",
      "name": "string",
      "email": "string",
      "university": "string",
      "postalCode": "string",
      "address": "string",
      "phoneNumber": "string",
      "showTitle": boolean,
      "showAlias": boolean
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "userId": "string",
        "updatedAt": "string"
      }
    }
    ```

- `POST /api/settings/user-profile/{userId}/image` - プロフィール画像アップロード（設定画面専用）
  - リクエスト: multipart/form-data
    - image: 画像ファイル
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "profileImageUrl": "string"
      }
    }
    ```

- `PUT /api/settings/user-profile/{userId}/title-alias` - 称号・二つ名更新（設定画面専用）
  - リクエスト:
    ```json
    {
      "title": "string",
      "alias": "string"
    }
    ```
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "profile": {
          "userId": "string",
          "title": "string",
          "alias": "string",
          "updatedAt": "string"
        }
      }
    }
    ```

### デバッグAPI
- `POST /debug/clear-battles` - バトルデータのクリア
  - レスポンス:
    ```json
    {
      "success": true,
      "data": {
        "message": "string"
      }
    }
    ```

## 注意事項
- VPS環境ではAPIキー認証は不要
- AWS環境への移行時は、APIキー認証が必須となります
- 環境変数や設定ファイルでベースURLを管理することを推奨
- 本番環境へのデプロイ時は、必ずステージング環境でのテストを実施

## ドキュメント構成

### 画面単位API分離原則による構成
各APIドキュメントは対応する画面専用の機能のみを定義し、他画面からの使用は禁止します：

- [認証API](auth.md) - ログイン画面専用の認証関連API
- [登録API](register.md) - 登録画面専用のアカウント作成関連API
- [ロビー画面API](lobby.md) - ロビー画面専用のユーザー情報・設定関連API
- [バトル画面API](battle.md) - バトル画面専用のマッチング・対戦・結果関連API
- [ランキング画面API](ranking.md) - ランキング画面専用のランキング表示関連API
- [設定画面API](settings.md) - 設定画面専用のプロフィール編集・画像管理関連API
- [実装状況](status.md) - APIの実装状況と優先度

### API分離の利点
1. **保守性**: 各画面の修正が他画面に影響しない
2. **安定性**: 画面固有の要件に最適化された専用API
3. **開発効率**: 画面担当者が独立して開発可能
4. **テスト容易性**: 画面単位での独立したテスト実行

## 環境情報

### エンドポイント情報
```
VPS環境（本番）:
- ベースURL: http://160.251.137.105/

開発環境（ローカル）:
- ベースURL: http://192.168.1.180:3000/dev/api

AWS環境（予定）:
- ベースURL: https://avwnok61nj.execute-api.ap-northeast-3.amazonaws.com/proc
```

### リージョン情報
```
リージョン: ap-northeast-3 (大阪)
```

### 注意事項
- 現在はVPS環境のエンドポイントを使用しています
- AWS環境への移行時は、API Gatewayのステージ名（proc）は環境によって異なる可能性があります
- リージョンは必要に応じて変更される可能性があります
- エンドポイントは環境変数や設定ファイルで管理することを推奨します
- 本番環境へのデプロイ時は、必ずステージング環境でのテストを実施してください 