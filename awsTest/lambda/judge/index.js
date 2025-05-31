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

        // MatchControllerを使用してマッチ判定処理
        const result = await matchController.judgeMatch(body);
        
        return result;

    } catch (error) {
        console.error("判定処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("判定処理中にエラーが発生しました");
    }
}; 