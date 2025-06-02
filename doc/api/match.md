# じゃんけんマッチングAPI

## マッチング開始

### エンドポイント
```
POST /match
```

### リクエスト
```json
{
  "userId": "string"       // ユーザーID
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "message": "マッチングを開始しました",
  "matchingId": "string",  // 生成されたマッチングID
  "status": "waiting"      // 初期状態は'waiting'
}
```

### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "マッチング開始に失敗しました",
  "error": {
    "code": "MATCH_START_ERROR",
    "details": "ユーザーが見つかりません"
  }
}
```

### エラーケース
1. APIキー未設定
   - ステータスコード: 401
   - メッセージ: "APIキーが設定されていません"

2. 必須パラメータ不足
   - ステータスコード: 400
   - メッセージ: "ユーザーIDは必須です"

3. ユーザー未検出
   - ステータスコード: 404
   - メッセージ: "指定されたユーザーが見つかりません"

4. 既存マッチング存在
   - ステータスコード: 409
   - メッセージ: "既にマッチング中です"

5. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "マッチング開始中にエラーが発生しました"

### 実装例

#### クライアント側（Flutter）
```dart
// マッチング開始
final startResponse = await http.post(
  Uri.parse('$baseUrl/match'),
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  },
  body: jsonEncode({
    'userId': userId,
  }),
);

if (startResponse.statusCode == 200) {
  final data = jsonDecode(startResponse.body);
  if (data['success']) {
    final matchingId = data['matchingId'];
    // マッチング開始成功時の処理
    print('マッチング開始成功: $matchingId');
    
    // マッチング状態のポーリングを開始
    Timer.periodic(Duration(seconds: 3), (timer) async {
      final statusResponse = await http.get(
        Uri.parse('$baseUrl/match?userId=$userId&matchingId=$matchingId'),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      );
      
      if (statusResponse.statusCode == 200) {
        final statusData = jsonDecode(statusResponse.body);
        if (statusData['status'] == 'matched') {
          timer.cancel();
          // 対戦画面に遷移
          Navigator.pushReplacement(context, /* ... */);
        }
      }
    });
  } else {
    // エラーメッセージの表示
    showErrorMessage(data['message']);
  }
}
```

#### サーバー側（Node.js）
```javascript
// マッチング開始
app.post('/dev/api/match', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ユーザーIDは必須です'
      });
    }

    // 既存のマッチングがないかチェック
    const existingMatch = await findActiveMatchByUserId(userId);
    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: '既にマッチング中です'
      });
    }

    // 新しいマッチングを作成
    const matchingId = generateMatchingId();
    await createMatch({
      id: matchingId,
      player1_id: userId,
      status: 'waiting',
      created_at: new Date()
    });

    res.json({
      success: true,
      message: 'マッチングを開始しました',
      matchingId: matchingId,
      status: 'waiting'
    });
  } catch (error) {
    console.error('マッチング開始エラー:', error);
    res.status(500).json({
      success: false,
      message: 'マッチング開始中にエラーが発生しました'
    });
  }
});
```

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
  "status": "string",       // マッチングの状態（waiting/matched/ready/draw/finished/cancelled）
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
    "judged": boolean,          // 結果が判定済みかどうか
    "is_finished": boolean      // 対戦終了かどうか
  }
}
```

### ステータス詳細仕様

#### ステータス値の定義
1. **waiting**: マッチング待機中（対戦相手を探している状態）
2. **matched**: マッチング成立（相手が見つかったが、準備が完了していない状態）
3. **ready**: 対戦準備完了（両者が準備完了し、手を出せる状態）
4. **draw**: 引き分け状態（結果が引き分けで、次のラウンドを待っている状態）
5. **finished**: 対戦終了（勝敗が決定し、マッチングが完全に終了した状態）
6. **cancelled**: キャンセル（どちらかのプレイヤーがキャンセルした状態）

#### ステータス遷移フロー
```
waiting → matched → ready → [判定] → draw/finished
    ↓         ↓       ↓
cancelled  cancelled  cancelled
```

#### クライアント側の画面別要件

##### 1. マッチング画面（matching_page.dart）
**処理するステータス**:
- `waiting`: 「相手を探しています...」メッセージを表示し、ポーリング継続
- `matched`: 対戦相手情報を表示し、準備ボタンを有効化
- `draw`: 「引き分け！もう一度勝負しましょう！」メッセージを表示
- `cancelled`: キャンセルメッセージを表示し、ロビー復帰ボタンを表示

**重要な処理**:
- `matched`状態で両者の`player1_ready`と`player2_ready`が`true`になったら、バトル画面に遷移
- `POST /match/ready`で準備状態を更新
- `draw`状態では引き分け回数（`draw_count`）を表示

##### 2. バトル画面（battle_page.dart）
**処理するステータス**:
- `ready`: 手を出すボタンを有効化、相手の手を待機
- `cancelled`: 「対戦相手が辞退しました」メッセージを表示し、ロビーに戻る
- `finished`: 「対戦が終了しました」メッセージを表示し、ロビーに戻る

**重要な処理**:
- 両者の手（`player1_hand`、`player2_hand`）が揃い、かつ`status`が`ready`の場合、`POST /match/judge`を呼び出す
- `result`フィールドに`judged: true`が含まれている場合、結果画面に遷移
- `POST /match/hand`で自分の手を送信

##### 3. リザルト画面（battle_result_page.dart）
**処理するステータス**:
- `ready`: 引き分けの場合、手をリセットしてバトル画面に戻る
- `draw`: 引き分けの場合、手をリセットしてバトル画面に戻る
- `waiting`: 引き分けの場合、手をリセットしてバトル画面に戻る
- `finished`: 勝敗決定の場合、ロビーに戻る

**重要な処理**:
- 引き分けの場合、`POST /match/reset_hands`を呼び出して次のラウンドを準備
- 勝敗が決定した場合（`result.is_finished: true`）、ロビーに戻る

#### クライアント側のエラーハンドリング
```dart
// エラーハンドリングとリトライ処理
Future<void> _checkMatchingStatus() async {
  try {
    // マッチングIDが設定されている場合はそれを使用
    String queryParams = 'userId=$userId';
    if (matchingData != null && matchingData['id'] != null) {
      queryParams += '&matchingId=${matchingData['id']}';
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/match?$queryParams')
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['success']) {
        // ステータスに応じた処理
        switch (data['status']) {
          case 'waiting':
            handleWaiting(data);
            break;
          case 'matched':
            handleMatched(data);
            break;
          case 'ready':
            handleReady(data);  // 両者準備完了時
            break;
          case 'draw':
            handleDraw(data);
            break;
          case 'finished':
            handleFinished(data);
            break;
          case 'cancelled':
            handleCancelled(data);
            break;
        }
      }
    }
  } catch (e) {
    print('マッチング状態確認エラー: $e');
    // 3秒後にリトライ
    Timer(Duration(seconds: 3), () => _checkMatchingStatus());
  }
}

// 準備完了処理
Future<void> updateReadyStatus() async {
  if (matchingData == null) return;
  
  // マッチングIDを正しく取得
  final matchingId = matchingData['id'] ?? matchingData['matchingId'];
  if (matchingId == null) {
    print('マッチングIDが見つかりません');
    return;
  }
  
  final response = await http.post(
    Uri.parse('$baseUrl/match/ready'),
    body: jsonEncode({
      'userId': userId,
      'matchingId': matchingId,
    }),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    if (data['success']) {
      // レスポンスのステータスに応じて処理
      if (data['status'] == 'ready') {
        // 両者準備完了 - バトル画面に遷移
        handleReady(data);
      } else if (data['status'] == 'matched') {
        // まだ相手が準備中
        handleMatched(data);
      }
    }
  }
}

// ready状態のハンドリング
void handleReady(Map<String, dynamic> data) {
  final isUser1 = data['player1_id'] == userId;
  final opponentId = isUser1 ? data['player2_id'] : data['player1_id'];
  
  // 対戦画面に遷移
  Navigator.pushReplacementNamed(
    context,
    '/battle',
    arguments: {
      'user_id': userId,
      'matching_id': data['id'],
      'opponent_id': opponentId,
      'is_user1': isUser1,
    },
  );
}

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

#### 完全なゲームフロー実装例

##### クライアント側の完全なシーケンス
```dart
// 1. マッチング開始
Future<void> startMatching() async {
  final response = await http.post(
    Uri.parse('$baseUrl/match'),
    body: jsonEncode({'userId': userId}),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    if (data['success']) {
      matchingId = data['matchingId'];
      // ステータス: waiting
      startPolling();
    }
  }
}

// 2. ポーリングでマッチング状態を監視
void startPolling() {
  Timer.periodic(Duration(seconds: 3), (timer) async {
    final status = await checkMatchingStatus();
    
    switch (status['status']) {
      case 'waiting':
        // 「相手を探しています...」表示
        break;
        
      case 'matched':
        // 対戦相手情報表示、準備ボタン有効化
        showOpponentInfo(status);
        break;
        
      case 'ready':
        // 両者準備完了 → バトル画面に遷移
        timer.cancel();
        navigateToBattle();
        break;
        
      case 'cancelled':
        // キャンセル処理
        timer.cancel();
        showCancelledMessage();
        break;
    }
  });
}

// 3. 準備完了ボタン押下時
Future<void> setReady() async {
  await http.post(
    Uri.parse('$baseUrl/match/ready'),
    body: jsonEncode({
      'userId': userId,
      'matchingId': matchingId,
    }),
  );
  // ポーリングで ready ステータスを検知してバトル画面へ
}

// 4. バトル画面での手の送信
Future<void> submitHand(String hand) async {
  await http.post(
    Uri.parse('$baseUrl/match/hand'),
    body: jsonEncode({
      'userId': userId,
      'matchingId': matchingId,
      'hand': hand,
    }),
  );
  // 相手の手を待つ
}

// 5. バトル画面でのポーリング
void pollBattleStatus() {
  Timer.periodic(Duration(seconds: 3), (timer) async {
    final status = await checkMatchingStatus();
    
    // 両者の手が揃ったら結果判定を要求
    if (status['player1_hand'] != null && 
        status['player2_hand'] != null &&
        status['status'] == 'ready') {
      await requestJudge();
    }
    
    // 結果が判定済みなら結果画面へ
    if (status['result'] != null && 
        status['result']['judged'] == true) {
      timer.cancel();
      navigateToResult(status['result']);
    }
  });
}

// 6. 結果判定の要求
Future<void> requestJudge() async {
  await http.post(
    Uri.parse('$baseUrl/match/judge'),
    body: jsonEncode({'matchingId': matchingId}),
  );
}

// 7. リザルト画面での処理
void handleResult(Map<String, dynamic> result) {
  if (result['is_draw']) {
    // 引き分けの場合：手をリセットしてバトル画面に戻る
    resetHandsAndContinue();
  } else if (result['is_finished']) {
    // 勝敗決定の場合：ロビーに戻る
    navigateToLobby();
  }
}

// 8. 引き分け時の手リセット
Future<void> resetHandsAndContinue() async {
  await http.post(
    Uri.parse('$baseUrl/match/reset_hands'),
    body: jsonEncode({'matchingId': matchingId}),
  );
  // バトル画面に戻る（draw_count が増加した状態）
  navigateToBattle();
}
```

##### サーバー側の状態管理例
```javascript
// マッチングの状態管理
class MatchingManager {
  // 1. 新規マッチング作成
  async createMatch(userId) {
    const matchingId = generateId();
    const match = {
      id: matchingId,
      player1_id: userId,
      player2_id: null,
      status: 'waiting',
      player1_ready: false,
      player2_ready: false,
      player1_hand: null,
      player2_hand: null,
      draw_count: 0,
      result: null
    };
    
    await saveMatch(match);
    
    // 他の待機中マッチングがあれば即座にマッチング
    await tryMatchmaking(matchingId);
    
    return match;
  }
  
  // 2. マッチング成立時の処理
  async tryMatchmaking(matchingId) {
    const waitingMatches = await findWaitingMatches();
    if (waitingMatches.length >= 2) {
      const match1 = waitingMatches[0];
      const match2 = waitingMatches[1];
      
      // match1 を updated、match2 を削除
      await updateMatch(match1.id, {
        player2_id: match2.player1_id,
        status: 'matched'
      });
      await deleteMatch(match2.id);
    }
  }
  
  // 3. 準備完了時の処理
  async setReady(userId, matchingId) {
    const match = await findMatch(matchingId);
    
    if (match.player1_id === userId) {
      match.player1_ready = true;
    } else {
      match.player2_ready = true;
    }
    
    // 両者準備完了なら ready ステータスに
    if (match.player1_ready && match.player2_ready) {
      match.status = 'ready';
    }
    
    await updateMatch(matchingId, match);
    return match;
  }
  
  // 4. 結果判定処理
  async judgeMatch(matchingId) {
    const match = await findMatch(matchingId);
    
    if (!match.player1_hand || !match.player2_hand) {
      throw new Error('両者の手が揃っていません');
    }
    
    const result = calculateResult(match.player1_hand, match.player2_hand);
    
    if (result.is_draw) {
      match.status = 'draw';
      match.draw_count++;
    } else {
      match.status = 'finished';
    }
    
    match.result = {
      ...result,
      judged: true,
      judged_at: new Date().toISOString()
    };
    
    await updateMatch(matchingId, match);
    return match;
  }
  
  // 5. 手のリセット処理
  async resetHands(matchingId) {
    const match = await findMatch(matchingId);
    
    match.player1_hand = null;
    match.player2_hand = null;
    match.status = 'ready';
    match.result = null;
    
    await updateMatch(matchingId, match);
    return match;
  }
}
```

#### クライアント側実装での注意点

##### 1. ステータス遷移の完全な処理
**問題**: `status: "ready"`の処理が抜けていると、両者準備完了後に対戦画面に遷移できない

**解決策**: 全てのステータス（waiting/matched/ready/draw/finished/cancelled）に対応したハンドラーを実装する

```dart
// ✅ 正しい実装
switch (data['status']) {
  case 'waiting':
    handleWaiting(data);
    break;
  case 'matched':
    handleMatched(data);
    break;
  case 'ready':
    handleReady(data);  // この処理が必須
    break;
  case 'draw':
    handleDraw(data);
    break;
  case 'finished':
    handleFinished(data);
    break;
  case 'cancelled':
    handleCancelled(data);
    break;
}
```

##### 2. マッチングIDの正しい管理
**問題**: レスポンスによって`id`や`matchingId`など異なるフィールド名が使われる

**解決策**: 複数のフィールドを確認してマッチングIDを取得する

```dart
// ✅ 安全なマッチングID取得
final matchingId = matchingData['id'] ?? 
                  matchingData['matchingId'] ?? 
                  matchingData['match_id'];

if (matchingId == null) {
  print('マッチングIDが見つかりません: $matchingData');
  return;
}
```

##### 3. プレイヤー判定の実装
**問題**: 自分がplayer1かplayer2かの判定を間違えると、相手の準備状態を誤認する

**解決策**: ユーザーIDを使用した明確な判定ロジック

```dart
// ✅ 正しいプレイヤー判定
final isUser1 = data['player1_id'] == currentUserId;
final opponentId = isUser1 ? data['player2_id'] : data['player1_id'];
final userReady = isUser1 ? data['player1_ready'] : data['player2_ready'];
final opponentReady = isUser1 ? data['player2_ready'] : data['player1_ready'];
```

##### 4. エラーハンドリングとリトライ
**問題**: ネットワークエラーやサーバーエラーでポーリングが停止する

**解決策**: 適切なエラーハンドリングとリトライ機能

```dart
// ✅ 堅牢なエラーハンドリング
try {
  final response = await http.get(uri).timeout(Duration(seconds: 10));
  // 処理...
} on TimeoutException {
  print('タイムアウト: 再試行します');
  scheduleRetry();
} catch (e) {
  print('エラー: $e');
  scheduleRetry();
}

void scheduleRetry() {
  Timer(Duration(seconds: 3), () {
    if (shouldContinuePolling) {
      _checkMatchingStatus();
    }
  });
}
```

##### 5. 文字エンコーディング問題の対策
**問題**: 日本語テキストでUTF-16エラーが発生する

**解決策**: 安全な文字列処理の実装

```dart
// ✅ 安全な文字列処理
String _safeString(dynamic value) {
  if (value == null) return '';
  try {
    final str = value.toString();
    // 不正な文字を除去
    return str.replaceAll(
      RegExp(r'[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]'), 
      ''
    );
  } catch (e) {
    print('文字列変換エラー: $e');
    return '';
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

## プレイヤー準備完了

### エンドポイント
```
POST /match/ready
```

### リクエスト
```json
{
  "userId": "string",      // ユーザーID
  "matchingId": "string"   // マッチングID
}
```

### レスポンス（成功時）
```json
{
  "success": true,
  "id": "string",           // マッチングID
  "player1_id": "string",   // プレイヤー1のID
  "player2_id": "string",   // プレイヤー2のID
  "status": "string",       // マッチングの状態（matched/ready）
  "player1_ready": boolean, // プレイヤー1の準備状態
  "player2_ready": boolean, // プレイヤー2の準備状態
  "player1_hand": "string", // プレイヤー1の手（null）
  "player2_hand": "string", // プレイヤー2の手（null）
  "draw_count": number,     // 引き分け回数
  "message": "string"       // 成功メッセージ
}
```

**注意**: レスポンス形式は GET /match と同一です。両プレイヤーが準備完了した場合、`status` が `"ready"` になります。

### レスポンス（失敗時）
```json
{
  "success": false,
  "message": "準備完了処理に失敗しました",
  "error": {
    "code": "READY_ERROR",
    "details": "マッチングが見つかりません"
  }
}
```

### エラーケース
1. 必須パラメータ不足
   - ステータスコード: 400
   - メッセージ: "ユーザーIDとマッチングIDは必須です"

2. マッチング未検出
   - ステータスコード: 404
   - メッセージ: "指定されたマッチングが見つかりません"

3. プレイヤー未参加
   - ステータスコード: 400
   - メッセージ: "このマッチに参加していません"

4. 不正な状態
   - ステータスコード: 400
   - メッセージ: "現在の状態では準備完了できません"

5. サーバーエラー
   - ステータスコード: 500
   - メッセージ: "準備完了処理中にエラーが発生しました"

### 実装例

#### クライアント側（Flutter）
```dart
// 準備完了処理
Future<void> setPlayerReady() async {
  final response = await http.post(
    Uri.parse('$baseUrl/match/ready'),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: jsonEncode({
      'userId': userId,
      'matchingId': matchingId,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    if (data['success']) {
      // レスポンスはGET /matchと同じ形式
      if (data['status'] == 'ready') {
        // 両者準備完了 - バトル画面に遷移
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => BattlePage(
              userId: userId,
              matchingId: data['id'],
              opponentId: data['player1_id'] == userId 
                ? data['player2_id'] 
                : data['player1_id'],
              isUser1: data['player1_id'] == userId,
            ),
          ),
        );
      } else {
        // まだ相手が準備中
        showMessage(data['message']);
      }
    }
  }
}
```

#### サーバー側（Node.js）
```javascript
// プレイヤー準備完了
app.post('/match/ready', async (req, res) => {
  try {
    const { userId, matchingId } = req.body;
    
    if (!userId || !matchingId) {
      return res.status(400).json({
        success: false,
        message: 'ユーザーIDとマッチングIDは必須です'
      });
    }

    // 準備完了処理を実行
    const result = await setPlayerReady(userId, matchingId);
    
    // GET /matchと同じ形式でレスポンス
    res.json(result);
  } catch (error) {
    console.error('準備完了処理エラー:', error);
    res.status(500).json({
      success: false,
      message: '準備完了処理中にエラーが発生しました'
    });
  }
});
``` 