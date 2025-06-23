const Minio = require('minio');
const sharp = require('sharp');
const crypto = require('crypto');

class ImageStorage {
    constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'awstest-minio',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: false,
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
        });
        this.buckets = {
            profile: 'profile-images',
            studentId: 'student-id-images'
        };
        this.initializeBuckets();
    }

    async initializeBuckets() {
        for (const bucket of Object.values(this.buckets)) {
            await this.ensureBucket(bucket);
        }
    }

    async ensureBucket(bucketName) {
        try {
            const exists = await this.client.bucketExists(bucketName);
            if (!exists) {
                await this.client.makeBucket(bucketName, 'us-east-1');
                // バケットポリシーの設定
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${bucketName}/*`],
                            Condition: {
                                StringEquals: {
                                    's3:prefix': ['public/']
                                }
                            }
                        }
                    ]
                };
                await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
                console.log(`✅ Bucket "${bucketName}" created and configured`);
            }
        } catch (error) {
            console.error(`❌ Error ensuring bucket "${bucketName}":`, error);
            throw error;
        }
    }

    generateFileName(userId, type, originalName) {
        const timestamp = Date.now();
        const hash = crypto.createHash('md5')
            .update(`${userId}${timestamp}${originalName}`)
            .digest('hex');
        const ext = originalName.split('.').pop().toLowerCase();
        return `${type}/${userId}/${hash}.${ext}`;
    }

    async optimizeImage(buffer, type) {
        const options = {
            profile: {
                width: 200,
                height: 200,
                fit: 'cover',
                format: 'jpeg',
                quality: 80
            },
            studentId: {
                width: 800,
                format: 'jpeg',
                quality: 90
            }
        };

        const opt = options[type];
        return sharp(buffer)
            .resize(opt.width, opt.height, { fit: opt.fit })
            .toFormat(opt.format, { quality: opt.quality })
            .toBuffer();
    }

    async uploadImage(userId, file, type) {
        try {
            const fileName = this.generateFileName(userId, type, file.originalname);
            const bucket = this.buckets[type];
            
            // 画像の最適化
            const optimizedBuffer = await this.optimizeImage(file.buffer, type);
            
            // メタデータの設定
            const metadata = {
                'Content-Type': file.mimetype,
                'x-amz-meta-user-id': userId,
                'x-amz-meta-upload-type': type,
                'x-amz-meta-original-name': file.originalname
            };

            // 画像のアップロード
            await this.client.putObject(
                bucket,
                fileName,
                optimizedBuffer,
                metadata
            );

            return {
                success: true,
                fileName: fileName,
                url: await this.getImageUrl(bucket, fileName)
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async getImageUrl(bucket, fileName) {
        try {
            // 24時間有効な署名付きURLを生成
            return await this.client.presignedGetObject(bucket, fileName, 24 * 60 * 60);
        } catch (error) {
            console.error('Error getting image URL:', error);
            throw error;
        }
    }

    async deleteImage(bucket, fileName) {
        try {
            await this.client.removeObject(bucket, fileName);
            return { success: true };
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
}

module.exports = new ImageStorage(); 