class ResponseService {
    /**
     * 標準的なHTTPレスポンスを生成
     */
    static createResponse(statusCode, body, headers = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Cache-Control': 'no-cache'
        };

        return {
            statusCode,
            headers: { ...defaultHeaders, ...headers },
            body: JSON.stringify(body)
        };
    }

    /**
     * 成功レスポンス
     */
    static success(data, statusCode = 200) {
        return this.createResponse(statusCode, {
            success: true,
            data
        });
    }

    /**
     * エラーレスポンス
     */
    static error(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        return this.createResponse(statusCode, {
            success: false,
            error: {
                code,
                message,
                details
            }
        });
    }

    /**
     * バリデーションエラー
     */
    static validationError(message, details = null) {
        return this.error(message, 400, 'VALIDATION_ERROR', details);
    }

    /**
     * 認証エラー
     */
    static authenticationError(message = 'ユーザーIDまたはパスワードが正しくありません') {
        return this.error(message, 401, 'AUTHENTICATION_ERROR');
    }

    /**
     * 認可エラー
     */
    static authorizationError(message = 'アクセス権限がありません') {
        return this.error(message, 403, 'AUTHORIZATION_ERROR');
    }

    /**
     * リソースが見つからない
     */
    static notFound(message = 'リソースが見つかりません') {
        return this.error(message, 404, 'NOT_FOUND');
    }

    /**
     * ビジネスルールエラー
     */
    static businessError(message, code = 'BUSINESS_ERROR') {
        return this.error(message, 400, code);
    }

    /**
     * じゃんけんゲーム用の成功レスポンス
     */
    static gameSuccess(message, gameData, statusCode = 200) {
        return this.createResponse(statusCode, {
            success: true,
            message,
            ...gameData
        });
    }

    /**
     * ログイン成功レスポンス
     */
    static loginSuccess(user, token = null) {
        const responseData = {
            success: true,
            user
        };

        if (token) {
            responseData.token = token;
        }

        return this.createResponse(200, responseData);
    }

    /**
     * ページング対応のリストレスポンス
     */
    static listSuccess(items, pagination = null) {
        const responseData = {
            success: true,
            data: items
        };

        if (pagination) {
            responseData.pagination = pagination;
        }

        return this.createResponse(200, responseData);
    }
}

module.exports = ResponseService; 