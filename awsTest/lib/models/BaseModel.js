const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: '+09:00',
    charset: 'utf8mb4',
    ssl: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

class BaseModel {
    constructor() {
        this.pool = pool;
    }

    /**
     * データベース接続を取得
     */
    async getConnection() {
        const connection = await this.pool.getConnection();
        
        // UTF-8エンコーディングを明示的に設定
        await connection.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
        await connection.execute("SET CHARACTER SET utf8mb4");
        await connection.execute("SET character_set_connection=utf8mb4");
        
        return connection;
    }

    /**
     * トランザクションを使用してクエリを実行
     */
    async executeTransaction(callback) {
        const connection = await this.getConnection();
        
        try {
            await connection.beginTransaction();
            console.log('🔄 Transaction started');
            
            const result = await callback(connection);
            
            await connection.commit();
            console.log('✅ Transaction committed');
            
            return result;
        } catch (error) {
            console.error('❌ Transaction error:', error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 安全なクエリ実行
     */
    async executeQuery(query, params = []) {
        console.log('📝 Executing query:', { query, params });
        const [rows] = await this.pool.execute(query, params);
        console.log('📝 Query result:', rows);
        return rows;
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
        console.log('📝 Creating record:', { tableName, fields });
        const result = await this.executeQuery(query, values);
        console.log('✅ Record created:', result);
        return result;
    }

    /**
     * レコード更新
     */
    async update(tableName, data, whereClause, whereParams = []) {
        const fields = Object.keys(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        
        const query = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
        console.log('📝 Updating record:', { tableName, fields, whereClause });
        const result = await this.executeQuery(query, values);
        console.log('✅ Record updated:', result);
        return result;
    }

    /**
     * レコード削除
     */
    async delete(tableName, whereClause, whereParams = []) {
        const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
        console.log('📝 Deleting record:', { tableName, whereClause });
        const result = await this.executeQuery(query, whereParams);
        console.log('✅ Record deleted:', result);
        return result;
    }
}

module.exports = BaseModel; 