const MatchController = require('../../lib/controllers/MatchController');

const matchController = new MatchController();

exports.handler = async (event) => {
    try {
        const ResponseService = require('../../lib/services/ResponseService');
        
        // HTTPメソッドに応じて処理を分岐
        if (event.httpMethod === 'GET') {
            // マッチング状態確認処理
            const { userId, matchingId } = event.queryStringParameters || {};
            
            if (!userId) {
                return ResponseService.validationError("ユーザーIDは必須です");
            }

            // MatchControllerを使用してマッチング状態取得処理
            if (matchingId) {
                // matchingIdが指定されている場合は特定のマッチングの状態を取得
                const result = await matchController.getMatchStatus(matchingId);
                return result;
            } else {
                // userIdのみの場合は、ユーザーの現在のマッチング状態を取得
                const result = await matchController.getUserMatchStatus(userId);
                return result;
            }
            
        } else if (event.httpMethod === 'POST') {
            // POSTリクエストの場合は、URLパスに応じて処理を分岐
            const path = event.path || '';
            console.log(`🔍 POST Request Path: "${path}"`);
            
            if (path.includes('/quit') || path === '/match/quit') {
                // マッチ辞退処理
                console.log('🚪 マッチ辞退処理を実行');
                let body;
                try {
                    body = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }
                
                const { userId, matchingId } = body;
                if (!userId || !matchingId) {
                    return ResponseService.validationError("ユーザーIDとマッチングIDは必須です");
                }
                
                // MatchControllerを使用してマッチ辞退処理
                const result = await matchController.quitMatch(body);
                return result;
                
            } else if (path === '/match') {
                // マッチング開始処理
                let body;
                try {
                    body = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }
                
                const { userId, matchType = "random" } = body;
                if (!userId) {
                    return ResponseService.validationError("ユーザーIDは必須です");
                }
                
                // MatchControllerを使用してマッチング開始処理
                const result = await matchController.startMatch(userId, matchType);
                return result;
                
            } else if (path.includes('/reset_hands')) {
                // 手のリセット処理
                let body;
                try {
                    body = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }
                
                const { matchingId } = body;
                if (!matchingId) {
                    return ResponseService.validationError("マッチングIDは必須です");
                }
                
                // MatchControllerを使用して手のリセット処理
                const result = await matchController.resetHands(matchingId);
                return result;
                
            } else if (path.includes('/ready') || path === '/match/ready') {
                // 準備完了処理
                let body;
                try {
                    body = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }
                
                const { userId, matchingId } = body;
                if (!userId || !matchingId) {
                    return ResponseService.validationError("ユーザーIDとマッチングIDは必須です");
                }
                
                // MatchControllerを使用して準備完了処理
                const result = await matchController.setPlayerReady(body);
                return result;
                
            } else {
                // 手の送信処理（デフォルト）
                console.log('✋ 手の送信処理を実行');
                let body;
                try {
                    body = JSON.parse(event.body);
                } catch (err) {
                    return ResponseService.validationError("Invalid JSON format");
                }

                // MatchControllerを使用して手の送信処理
                const result = await matchController.submitHand(body);
                return result;
            }
        } else {
            return ResponseService.validationError("サポートされていないHTTPメソッドです");
        }

    } catch (error) {
        console.error("Hand API処理エラー:", error);
        const ResponseService = require('../../lib/services/ResponseService');
        return ResponseService.error("API処理中にエラーが発生しました");
    }
}; 