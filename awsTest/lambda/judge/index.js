const redis = require("redis");

// Redis接続設定を環境変数から取得
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_URL = process.env.REDIS_URL || `redis://${REDIS_HOST}:${REDIS_PORT}`;

const client = redis.createClient({
  url: REDIS_URL
});

client.connect().catch(console.error);

const judgeMatch = async (matchingId) => {
  try {
    const matchData = await client.get(matchingId);
    if (!matchData) {
      return {
        success: false,
        message: "マッチングデータが見つかりません"
      };
    }

    const parsedData = JSON.parse(matchData);

    // じゃんけんの勝敗判定ロジック
    const player1Hand = parsedData.player1_hand;
    const player2Hand = parsedData.player2_hand;
    
    if (!player1Hand || !player2Hand) {
      return {
        success: false,
        message: "両プレイヤーの手が揃っていません"
      };
    }

    // 勝敗判定
    let result = {
      player1_result: "",
      player2_result: "",
      is_draw: false,
      draw_count: parsedData.draw_count || 0
    };

    if (player1Hand === player2Hand) {
      result.is_draw = true;
      result.draw_count += 1;
      result.player1_result = "draw";
      result.player2_result = "draw";
    } else if (
      (player1Hand === "rock" && player2Hand === "scissors") ||
      (player1Hand === "scissors" && player2Hand === "paper") ||
      (player1Hand === "paper" && player2Hand === "rock")
    ) {
      result.player1_result = "win";
      result.player2_result = "lose";
    } else {
      result.player1_result = "lose";
      result.player2_result = "win";
    }

    result.is_finished = true;
    return result;

  } catch (error) {
    console.error("Redis取得エラー:", error);
    return { success: false, message: "Redisデータ取得エラー" };
  }
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { matchingId, player1_hand, player2_hand, draw_count } = body;

    if (!matchingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "マッチングIDは必須です"
        })
      };
    }

    // Redisにマッチングデータを保存
    await client.set(
      matchingId,
      JSON.stringify({
        player1_hand,
        player2_hand,
        draw_count
      })
    );

    // 結果判定処理
    const result = await judgeMatch(matchingId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result
      })
    };
  } catch (error) {
    console.error("結果判定エラー:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "結果判定中にエラーが発生しました"
      })
    };
  }
}; 