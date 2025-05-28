const Redis = require("ioredis");
const RedisUtil = require("../../utils/godlib_redis/redisUtil");

const judgeMatch = async (matchingId) => {
  let redis = null;
  try {
    // Redis接続設定（RedisUtilを使用）
    const redisConfig = RedisUtil.redis_confset(process, 1);
    redis = new Redis(redisConfig.connection);

    // hand関数で作成されたマッチデータを取得
    const matchKey = `match:${matchingId}`;
    const matchData = await redis.hgetall(matchKey);
    
    if (!matchData || Object.keys(matchData).length === 0) {
      return {
        success: false,
        message: "マッチングデータが見つかりません"
      };
    }

    console.log("取得したマッチデータ:", matchData);

    // ゲーム終了状態のチェック
    if (matchData.game_status === "finished") {
      return {
        success: false,
        message: "このマッチは既に終了しています"
      };
    }

    // 両プレイヤーの手の履歴を取得
    const player1HandHistory = matchData[`${matchData.player1_id}_hand_history`] 
      ? JSON.parse(matchData[`${matchData.player1_id}_hand_history`]) : [];
    const player2HandHistory = matchData[`${matchData.player2_id}_hand_history`] 
      ? JSON.parse(matchData[`${matchData.player2_id}_hand_history`]) : [];

    console.log("プレイヤー1手履歴:", player1HandHistory);
    console.log("プレイヤー2手履歴:", player2HandHistory);

    // 履歴の長さが同じかチェック（同期確認）
    if (player1HandHistory.length !== player2HandHistory.length) {
      return {
        success: false,
        message: `手の履歴が同期していません。プレイヤー1: ${player1HandHistory.length}回, プレイヤー2: ${player2HandHistory.length}回`
      };
    }

    // 履歴が空でないかチェック
    if (player1HandHistory.length === 0 || player2HandHistory.length === 0) {
      return {
        success: false,
        message: "両プレイヤーの手が揃っていません"
      };
    }

    // 最新の手を取得
    const player1Hand = player1HandHistory[player1HandHistory.length - 1];
    const player2Hand = player2HandHistory[player2HandHistory.length - 1];
    
    if (!player1Hand || !player2Hand) {
      return {
        success: false,
        message: "最新の手が取得できません"
      };
    }

    // 勝敗判定（日本語の手に対応）
    let result = {
      player1_hand: player1Hand,
      player2_hand: player2Hand,
      player1_result: "",
      player2_result: "",
      winner: 0,
      is_draw: false,
      draw_count: parseInt(matchData.drawCount || "0"),
      judged: true,
      judged_at: new Date().toISOString(),
      is_finished: false
    };

    if (player1Hand === player2Hand) {
      // 引き分け
      result.is_draw = true;
      result.draw_count += 1;
      result.player1_result = "draw";
      result.player2_result = "draw";
      result.winner = 3; // 3=引き分け
      
      // 最大引き分け回数の設定（環境変数またはデフォルト値）
      const maxDrawCount = parseInt(process.env.MAX_DRAW_COUNT || "3");
      
      if (result.draw_count >= maxDrawCount) {
        gameStatus = "finished";
        nextAction = `${maxDrawCount}回連続引き分けのため、ゲーム終了です。ロビーに戻ってください。`;
        result.is_finished = true;
        result.finish_reason = "max_draw_reached";
        console.log(`最大引き分け回数(${maxDrawCount})に達したため、ゲーム終了`);
      } else {
        result.is_finished = false;
        // 引き分けの場合、手の履歴をリセット（次のラウンド用）
        await redis.hdel(matchKey, 
          `${matchData.player1_id}_hand_history`,
          `${matchData.player2_id}_hand_history`
        );
        console.log("引き分けのため手の履歴をリセットしました");
      }
    } else if (
      (player1Hand === "グー" && player2Hand === "チョキ") ||
      (player1Hand === "チョキ" && player2Hand === "パー") ||
      (player1Hand === "パー" && player2Hand === "グー")
    ) {
      // プレイヤー1の勝利
      result.player1_result = "win";
      result.player2_result = "lose";
      result.winner = 1;
      result.is_finished = true;
    } else {
      // プレイヤー2の勝利
      result.player1_result = "lose";
      result.player2_result = "win";
      result.winner = 2;
      result.is_finished = true;
    }

    // 結果をRedisに保存
    const updatedMatchData = {
      ...matchData,
      drawCount: result.draw_count.toString(),
      winner: result.winner.toString(),
      judged: "true",
      judged_at: result.judged_at,
      is_finished: result.is_finished.toString(),
      game_status: result.is_finished ? "finished" : "next_round",
      lastJudgeTime: Date.now().toString()
    };

    await redis.hmset(matchKey, updatedMatchData);
    console.log("判定結果をRedisに保存:", updatedMatchData);

    return result;

  } catch (error) {
    console.error("Redis取得エラー:", error);
    return { success: false, message: "Redisデータ取得エラー" };
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { matchingId } = body;

    if (!matchingId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "マッチングIDは必須です"
        })
      };
    }

    console.log("判定開始 - マッチングID:", matchingId);

    // 結果判定処理
    const result = await judgeMatch(matchingId);

    // エラーの場合のみ404を返す
    if (result.success === false) {
      return {
        statusCode: 404,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result: {
          player1_hand: result.player1_hand,
          player2_hand: result.player2_hand,
          player1_result: result.player1_result,
          player2_result: result.player2_result,
          winner: result.winner,
          is_draw: result.is_draw,
          draw_count: result.draw_count,
          judged: result.judged,
          judged_at: result.judged_at,
          is_finished: result.is_finished,
          finish_reason: result.finish_reason || null
        }
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