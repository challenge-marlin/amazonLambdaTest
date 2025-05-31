const mysql = require('mysql2/promise');

class BaseModel {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            timezone: '+09:00',
            charset: 'utf8mb4',
            ssl: false,
            supportBigNumbers: true,
            bigNumberStrings: true,
            dateStrings: false
        };
    }

    /**
     * データベース接続を取得
     */
    async getConnection() {
        const connection = await mysql.createConnection(this.dbConfig);
        
        // UTF-8エンコーディングを明示的に設定
        await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        await connection.execute("SET CHARACTER SET utf8mb4");
        await connection.execute("SET character_set_connection=utf8mb4");
        
        return connection;
    }

    /**
     * 安全なクエリ実行
     */
    async executeQuery(query, params = []) {
        const connection = await this.getConnection();
        
        try {
            const [rows] = await connection.execute(query, params);
            return rows;
        } finally {
            await connection.end();
        }
    }

    /**
     * 単一レコード取得
     */
    async findOne(query, params = []) {
        const rows = await this.executeQuery(query, params);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * 複数レコード取得
     */
    async findMany(query, params = []) {
        return await this.executeQuery(query, params);
    }

    /**
     * レコード作成
     */
    async create(tableName, data) {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(data);
        
        const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        return await this.executeQuery(query, values);
    }

    /**
     * レコード更新
     */
    async update(tableName, data, whereClause, whereParams = []) {
        const fields = Object.keys(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        
        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
        return await this.executeQuery(query, values);
    }

    /**
     * レコード削除
     */
    async delete(tableName, whereClause, whereParams = []) {
        const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
        return await this.executeQuery(query, whereParams);
    }
}

module.exports = BaseModel; 