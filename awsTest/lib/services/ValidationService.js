class ValidationService {
    /**
     * 必須フィールドのチェック
     */
    static validateRequired(data, requiredFields) {
        const errors = [];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field] === '') {
                errors.push(`${field}は必須です`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * じゃんけんの手のバリデーション
     */
    static validateJankenHand(hand) {
        const validHands = ["グー", "チョキ", "パー"];
        return {
            isValid: validHands.includes(hand),
            errors: validHands.includes(hand) ? [] : [`手は「${validHands.join('」「')}」のいずれかである必要があります`]
        };
    }

    /**
     * ユーザーIDのバリデーション
     */
    static validateUserId(userId) {
        const errors = [];
        
        if (!userId) {
            errors.push('ユーザーIDは必須です');
        } else if (typeof userId !== 'string') {
            errors.push('ユーザーIDは文字列である必要があります');
        } else if (userId.length < 3) {
            errors.push('ユーザーIDは3文字以上である必要があります');
        } else if (userId.length > 50) {
            errors.push('ユーザーIDは50文字以下である必要があります');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * パスワードのバリデーション
     */
    static validatePassword(password) {
        const errors = [];
        
        if (!password) {
            errors.push('パスワードは必須です');
        } else if (typeof password !== 'string') {
            errors.push('パスワードは文字列である必要があります');
        } else if (password.length < 6) {
            errors.push('パスワードは6文字以上である必要があります');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * メールアドレスのバリデーション
     */
    static validateEmail(email) {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            // メールアドレスは必須ではない場合があるので、空の場合は有効とする
            return { isValid: true, errors: [] };
        }
        
        if (!emailRegex.test(email)) {
            errors.push('有効なメールアドレスを入力してください');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 電話番号のバリデーション
     */
    static validatePhoneNumber(phoneNumber) {
        const errors = [];
        const phoneRegex = /^[\d\-\(\)\+\s]+$/;
        
        if (!phoneNumber) {
            // 電話番号は必須ではない場合があるので、空の場合は有効とする
            return { isValid: true, errors: [] };
        }
        
        if (!phoneRegex.test(phoneNumber)) {
            errors.push('有効な電話番号を入力してください');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 日本の郵便番号のバリデーション
     */
    static validatePostalCode(postalCode) {
        const errors = [];
        const postalCodeRegex = /^\d{3}-?\d{4}$/;
        
        if (!postalCode) {
            return { isValid: true, errors: [] };
        }
        
        if (!postalCodeRegex.test(postalCode)) {
            errors.push('郵便番号は「123-4567」または「1234567」の形式で入力してください');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * ユーザープロフィール更新のバリデーション
     */
    static validateUserProfileUpdate(data) {
        const errors = [];
        const allowedFields = ['name', 'nickname', 'email', 'university', 'postalCode', 'address', 'phoneNumber'];
        
        // 許可されていないフィールドのチェック
        const invalidFields = Object.keys(data).filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
            errors.push(`許可されていないフィールドです: ${invalidFields.join(', ')}`);
        }

        // 個別フィールドのバリデーション
        if (data.email) {
            const emailValidation = this.validateEmail(data.email);
            if (!emailValidation.isValid) {
                errors.push(...emailValidation.errors);
            }
        }

        if (data.phoneNumber) {
            const phoneValidation = this.validatePhoneNumber(data.phoneNumber);
            if (!phoneValidation.isValid) {
                errors.push(...phoneValidation.errors);
            }
        }

        if (data.postalCode) {
            const postalValidation = this.validatePostalCode(data.postalCode);
            if (!postalValidation.isValid) {
                errors.push(...postalValidation.errors);
            }
        }

        // 文字列長のチェック
        if (data.name && data.name.length > 100) {
            errors.push('名前は100文字以下である必要があります');
        }

        if (data.nickname && data.nickname.length > 50) {
            errors.push('ニックネームは50文字以下である必要があります');
        }

        if (data.university && data.university.length > 100) {
            errors.push('大学名は100文字以下である必要があります');
        }

        if (data.address && data.address.length > 255) {
            errors.push('住所は255文字以下である必要があります');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * ログインリクエストのバリデーション
     */
    static validateLoginRequest(data) {
        const userIdValidation = this.validateUserId(data.userId);
        const passwordValidation = this.validatePassword(data.password);
        
        const allErrors = [...userIdValidation.errors, ...passwordValidation.errors];
        
        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }

    /**
     * じゃんけん手の送信リクエストのバリデーション
     */
    static validateHandSubmission(data) {
        const errors = [];
        
        // 必須フィールドチェック
        const requiredValidation = this.validateRequired(data, ['userId', 'matchingId', 'hand']);
        if (!requiredValidation.isValid) {
            errors.push(...requiredValidation.errors);
        }

        // 手のバリデーション
        if (data.hand) {
            const handValidation = this.validateJankenHand(data.hand);
            if (!handValidation.isValid) {
                errors.push(...handValidation.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * マッチ判定リクエストのバリデーション
     */
    static validateJudgeRequest(data) {
        const requiredValidation = this.validateRequired(data, ['matchingId']);
        
        return {
            isValid: requiredValidation.isValid,
            errors: requiredValidation.errors
        };
    }
}

module.exports = ValidationService; 