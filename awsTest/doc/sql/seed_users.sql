-- 既存のusersデータを削除
DELETE FROM users;

-- 基本となる5人のユーザーを挿入
INSERT INTO users (
    management_code,
    user_id,
    email,
    password,
    name,
    nickname,
    postal_code,
    address,
    phone_number,
    university,
    birthdate,
    profile_image_url,
    student_id_image_url,
    created_at,
    updated_at,
    register_type,
    is_student_id_editable,
    is_banned
) VALUES 
(1, 'user001', 'user001@example.com', 'password001', '山田 太郎', 'やまだ',
 '123-4567', '東京都渋谷区渋谷1-1-1', '090-1234-5678', '東京大学', '1995-05-15',
 'https://lesson01.myou-kou.com/avatars/defaultAvatar1.png',
 'https://lesson01.myou-kou.com/avatars/defaultStudentId.png',
 '2023-01-01T00:00:00', '2023-01-01T00:00:00', 'email', 1, 0),

(2, 'user002', 'user002@example.com', 'password002', '佐藤 花子', 'はなこ',
 '234-5678', '大阪府大阪市中央区1-2-3', '090-2345-6789', '大阪大学', '1997-07-25',
 'https://lesson01.myou-kou.com/avatars/defaultAvatar2.png',
 'https://lesson01.myou-kou.com/avatars/defaultStudentId.png',
 '2023-01-02T00:00:00', '2023-01-02T00:00:00', 'email', 1, 0),

(3, 'user003', 'user003@example.com', 'password003', '鈴木 一郎', 'いちろう',
 '345-6789', '神奈川県横浜市青葉区2-3-4', '090-3456-7890', '慶應義塾大学', '1996-12-05',
 'https://lesson01.myou-kou.com/avatars/defaultAvatar3.png',
 'https://lesson01.myou-kou.com/avatars/defaultStudentId.png',
 '2023-01-03T00:00:00', '2023-01-03T00:00:00', 'email', 1, 0),

(4, 'user004', 'user004@example.com', 'password004', '中村 健太', 'けんた',
 '901-2345', '沖縄県那覇市5-6-7', '090-9012-3456', '琉球大学', '1999-09-30',
 'https://lesson01.myou-kou.com/avatars/defaultAvatar4.png',
 'https://lesson01.myou-kou.com/avatars/defaultStudentId.png',
 '2023-01-30T00:00:00', '2023-01-30T00:00:00', 'email', 1, 0),

(5, 'user005', 'user005@example.com', 'password005', '田中 裕美子', 'ニャンタス',
 '639-6577', '徳島県昭島市清水 Street8-2-5', '090-8074-1525', '同志社大学', '1995-09-26',
 'https://lesson01.myou-kou.com/avatars/defaultAvatar5.png',
 'https://lesson01.myou-kou.com/avatars/defaultStudentId.png',
 '2024-09-09T02:38:52', '2024-09-09T02:38:52', 'email', 1, 0);
