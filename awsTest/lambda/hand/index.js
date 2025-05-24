const Redis = require("ioredis");
const RedisUtil = require("../../utils/redis/redisUtil");

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

    // Redis接続設定
    redis = new Redis(RedisUtil.getConfig());
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

    // マッチデータが存在しない場合、初期化
    if (!matchData || Object.keys(matchData).length === 0) {
      matchData = {
        drawCount: "0",
        winner: "0",
        matchType: matchType || "random",
      };
      console.log("新規マッチ作成:", matchData);
    }

    // 既存のマッチ情報を更新
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

    // 手の履歴を更新
    const handHistoryKey = `${userId}_hand_history`;
    const handHistory = matchData[handHistoryKey] ? JSON.parse(matchData[handHistoryKey]) : [];
    handHistory.push(hand);

    // マッチデータを更新
    const updatedMatchData = {
      ...matchData,
      ...updateData,
      [handHistoryKey]: JSON.stringify(handHistory),
      matchType: matchType || "random",
      drawCount: matchData.drawCount || "0",
      winner: matchData.winner || "0",
      lastUpdateTime: Date.now().toString(),
    };

    // Redisに保存
    await redis.hmset(matchKey, updatedMatchData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "手を送信しました",
        status: "waiting",
        matchData: {
          matchingId,
          player1_id: updatedMatchData.player1_id,
          player2_id: updatedMatchData.player2_id,
          yourHand: hand,
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