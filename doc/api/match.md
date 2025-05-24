# じゃんけんマッチングAPI

## マッチング状態確認

### エンドポイント
```
GET /match
```

### リクエストパラメータ
- userId: ユーザーID（クエリパラメータ）
- matchingId: マッチングID（クエリパラメータ）

### レスポンス（成功時）
```json
{
  "success": true,
  "id": "string",           // マッチングID
  "player1_id": "string",   // プレイヤー1のID
  "player2_id": "string",   // プレイヤー2のID
  "status": "string",       // マッチングの状態（waiting/ready/draw/finished）
  "player1_ready": boolean, // プレイヤー1の準備状態
  "player2_ready": boolean, // プレイヤー2の準備状態
  "player1_hand": "string", // プレイヤー1の手（グー/チョキ/パー）
  "player2_hand": "string", // プレイヤー2の手（グー/チョキ/パー）
  "draw_count": number,     // 現在の引き分け回数
  "result": {               // 結果判定済みの場合のみ
    "player1_result": "string", // win/lose/draw
    "player2_result": "string", // win/lose/draw
    "winner": number,           // 1=プレイヤー1, 2=プレイヤー2, 3=引き分け
    "is_draw": boolean,         // 引き分けかどうか
    "is_finished": boolean      // 対戦終了かどうか
  }
}
```

### レスポンス（失敗時）
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

## 手の送信

### エンドポイント
```
POST /match/hand
```

### リクエスト
```json
{
  "userId": "string",      // ユーザーID
  "matchingId": "string",  // マッチングID
  "hand": "string"         // 手（グー/チョキ/パー）
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "message": "手を送信しました",
  "status": "string"       // 手の状態（waiting/ready）
}
```

### レスポンス（失敗時）
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

### エラーケース
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

### 実装例

#### クライアント側（Flutter）
```dart
// マッチング状態確認
final response = await http.get(
  Uri.parse('$baseUrl/match?userId=$userId&matchingId=$matchingId'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  if (data['success']) {
    // マッチング状態取得成功時の処理
    final match = data;
    if (match['status'] == 'ready') {
      // 両者の手が揃った場合、結果画面に遷移
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => BattleResultPage(
            matchingId: match['id'],
            // その他必要なパラメータ
          ),
        ),
      );
    }
  } else {
    // エラーメッセージの表示
    showErrorMessage(data['message']);
  }
}

// 手の送信
final handResponse = await http.post(
  Uri.parse('$baseUrl/match/hand'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: jsonEncode({
    'userId': userId,
    'matchingId': matchingId,
    'hand': hand,
  }),
);

// 結果判定
final judgeResponse = await http.post(
  Uri.parse('$baseUrl/match/judge'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: jsonEncode({
    'matchingId': matchingId,
  }),
);

if (judgeResponse.statusCode == 200) {
  final data = jsonDecode(judgeResponse.body);
  if (data['success']) {
    final result = data['result'];
    // 結果に基づいて画面を更新
    setState(() {
      // 結果表示の更新
    });
    
    // 結果に応じて次の画面に遷移
    if (result['is_finished']) {
      // ロビーに戻る
    } else if (result['is_draw']) {
      // 次のラウンドに進む
    }
  }
}
```

#### サーバー側（Node.js）
```javascript
// 結果判定
app.post('/dev/api/match/judge', async (req, res) => {
  try {
    const { matchingId } = req.body;
    
    if (!matchingId) {
      return res.status(400).json({
        success: false,
        message: 'マッチングIDは必須です'
      });
    }

    // 結果判定処理
    const result = await judgeMatch(matchingId);

    // 結果判定成功
    res.json({
      success: true,
      result: {
        player1_result: result.player1_result,
        player2_result: result.player2_result,
        is_draw: result.is_draw,
        draw_count: result.draw_count,
        is_finished: result.is_finished
      }
    });
  } catch (error) {
    console.error('結果判定エラー:', error);
    res.status(500).json({
      success: false,
      message: '結果判定中にエラーが発生しました'
    });
  }
});
```

## 結果判定

### エンドポイント
```
POST /match/judge
```

### リクエスト
```json
{
  "matchingId": "string"   // マッチングID
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "result": {
    "player1_hand": "string",    // プレイヤー1の手
    "player2_hand": "string",    // プレイヤー2の手
    "player1_result": "string",  // win/lose/draw
    "player2_result": "string",  // win/lose/draw
    "winner": number,            // 1=プレイヤー1, 2=プレイヤー2, 3=引き分け
    "is_draw": boolean,          // 引き分けかどうか
    "draw_count": number,        // 引き分け回数
    "judged": boolean,           // 結果が判定済みかどうか
    "judged_at": "string",       // 判定時刻（ISO 8601形式）
    "is_finished": boolean       // 対戦終了かどうか
  }
}
```

## 手のリセット

### エンドポイント
```
POST /match/reset_hands
```

### リクエスト
```json
{
  "matchingId": "string"   // マッチングID
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "message": "手をリセットしました",
  "status": "string"       // 新しい状態（waiting）
}
```

### エラーケース
1. APIキー未設定
   - ステータスコード: 401
   - メッセージ: "APIキーが設定されていません"

2. 必須パラメータ不足
   - ステータスコード: 400
   - メッセージ: "必須パラメータが不足しています"

3. 無効な手
   - ステータスコード: 400
   - メッセージ: "無効な手です（グー/チョキ/パーのいずれかを指定してください）"

4. マッチング未検出
   - ステータスコード: 404
   - メッセージ: "指定されたマッチングが見つかりません"

5. 不正な状態
   - ステータスコード: 400
   - メッセージ: "現在の状態では操作できません"

6. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "サーバーエラーが発生しました" 