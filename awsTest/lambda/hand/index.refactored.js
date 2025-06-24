const MatchController = require('../../lib/controllers/MatchController');

const matchController = new MatchController();

exports.handler = async (event) => {
    try {
        // リクエストボディの解析
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            const ResponseService = require('../../lib/services/ResponseService');
            return ResponseService.validationError("Invalid JSON format");
        }

        // MatchControllerを使用して手の送信処理
        const result = await matchController.submitHand(body);
        
        return result;

    } catch (error) {
        console.error("手の送信エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("手の送信中にエラーが発生しました");
    }
}; 