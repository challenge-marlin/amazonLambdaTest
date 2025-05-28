const Redis = require("ioredis");
const RedisUtil = require("../../utils/godlib_redis/redisUtil");

exports.handler = async (event) => {
  let redis = null;
  try {
    const body = JSON.parse(event.body);
    const { userId, matchingId, hand, matchType } = body;

    // 入力チェック
    if (!userId || !matchingId || !["グー", "チョキ", "パー"].includes(hand)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "ユーザーID、マッチングID、手は必須です（グー/チョキ/パー）",
        }),
      };
    }

    // Redis接続設定（RedisUtilを使用）
    const redisConfig = RedisUtil.redis_confset(process, 1);
    console.log(`Redis設定: ${JSON.stringify(redisConfig)}`);
    redis = new Redis(redisConfig.connection);
    console.log("Redis接続確立");

    // Redisに保存されているマッチング情報を取得
    const matchKey = `match:${matchingId}`;
    let matchData;
    try {
      matchData = await redis.hgetall(matchKey);
      console.log("マッチデータ取得:", matchData);
    } catch (error) {
      console.error("マッチデータ取得エラー:", error);
      throw error;
    }

    // ゲーム終了状態のチェック
    if (matchData.game_status === "finished") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "このマッチは既に終了しています",
        }),
      };
    }

    // マッチデータが存在しない場合、初期化
    if (!matchData || Object.keys(matchData).length === 0) {
      matchData = {
        drawCount: "0",
        winner: "0",
        matchType: matchType || "random",
        game_status: "waiting",
      };
      console.log("新規マッチ作成:", matchData);
    }

    // プレイヤーの参加処理
    let updateData = {};
    if (!matchData.player1_id) {
      updateData.player1_id = userId;
    } else if (!matchData.player2_id && matchData.player1_id !== userId) {
      updateData.player2_id = userId;
    } else if (matchData.player1_id !== userId && matchData.player2_id !== userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "このマッチには参加できません",
        }),
      };
    }

    // 重複送信チェック
    const handHistoryKey = `${userId}_hand_history`;
    const handHistory = matchData[handHistoryKey] ? JSON.parse(matchData[handHistoryKey]) : [];
    
    // 相手プレイヤーの手履歴を取得
    const otherPlayerId = matchData.player1_id === userId ? matchData.player2_id : matchData.player1_id;
    if (otherPlayerId) {
      const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
      const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
      
      // 既に手を出している場合のチェック（同じラウンドで重複送信防止）
      if (handHistory.length > otherHandHistory.length) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            success: false,
            message: "既にこのラウンドの手を送信済みです。相手の手を待ってください。",
          }),
        };
      }
    }

    // 手の履歴を更新
    handHistory.push(hand);

    // 両プレイヤーの手が揃ったかチェック
    let gameStatus = "waiting";
    let statusMessage = "相手の手を待っています";
    let canJudge = false;

    if (matchData.player1_id && matchData.player2_id) {
      const otherHandHistoryKey = `${otherPlayerId}_hand_history`;
      const otherHandHistory = matchData[otherHandHistoryKey] ? JSON.parse(matchData[otherHandHistoryKey]) : [];
      
      if (handHistory.length === otherHandHistory.length && handHistory.length > 0) {
        gameStatus = "ready";
        statusMessage = "両プレイヤーの手が揃いました。判定可能です。";
        canJudge = true;
      }
    }

    // マッチデータを更新
    const updatedMatchData = {
      ...matchData,
      ...updateData,
      [handHistoryKey]: JSON.stringify(handHistory),
      matchType: matchType || "random",
      drawCount: matchData.drawCount || "0",
      winner: matchData.winner || "0",
      game_status: gameStatus,
      lastUpdateTime: Date.now().toString(),
    };

    // Redisに保存
    await redis.hmset(matchKey, updatedMatchData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "手を送信しました",
        status: gameStatus,
        statusMessage: statusMessage,
        canJudge: canJudge,
        matchData: {
          matchingId,
          player1_id: updatedMatchData.player1_id,
          player2_id: updatedMatchData.player2_id,
          yourHand: hand,
          roundNumber: handHistory.length,
        }
      }),
    };
  } catch (error) {
    console.error("エラー発生:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "手の送信中にエラーが発生しました",
      }),
    };
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}; 