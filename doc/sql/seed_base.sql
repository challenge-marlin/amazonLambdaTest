-- データベースの選択
USE userdb;

-- 既存データのクリア
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE admin_logs;
TRUNCATE TABLE daily_ranking;
TRUNCATE TABLE match_history;
TRUNCATE TABLE registration_itemdata;
TRUNCATE TABLE user_stats;
TRUNCATE TABLE user_logs;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS=1;

-- 管理者オペレーションログのサンプルデータ
INSERT INTO admin_logs (admin_user, operation, target_id, details, operated_at) VALUES
('admin001', 'USER_BAN', 'user015', '不正行為の疑い', '2025-05-01 10:00:00'),
('admin002', 'USER_UNBAN', 'user057', '調査完了', '2025-05-02 15:30:00'),
('admin001', 'PROFILE_UPDATE', 'user032', 'プロフィール画像の削除', '2025-05-03 09:15:00');

-- ユーザー情報のサンプルデータ
INSERT INTO users (management_code, user_id, email, password, name, nickname, postal_code, university, birthdate, profile_image_url, student_id_image_url, register_type) VALUES
(1, 'user001', 'user001@example.com', '$2a$10$XXXXX', '山田太郎', 'やまだ', '100-0001', '東京大学', '2000-01-01', 'https://example.com/profiles/1.jpg', 'https://example.com/student_ids/1.jpg', 'email'),
(2, 'user002', 'user002@example.com', '$2a$10$XXXXX', '鈴木花子', 'すずき', '100-0002', '慶應義塾大学', '2000-02-02', 'https://example.com/profiles/2.jpg', 'https://example.com/student_ids/2.jpg', 'google'),
(3, 'user003', 'user003@example.com', '$2a$10$XXXXX', '佐藤次郎', 'さとう', '100-0003', '早稲田大学', '2000-03-03', 'https://example.com/profiles/3.jpg', 'https://example.com/student_ids/3.jpg', 'line');

-- ユーザー端末識別情報のサンプルデータ
INSERT INTO registration_itemdata (management_code, subnum, itemtype, itemid, created_at) VALUES
(1, 1, 1, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
(1, 2, 2, '2025-01-02 00:00:00', '2025-01-02 00:00:00'),
(2, 1, 1, '2025-01-03 00:00:00', '2025-01-03 00:00:00');

-- ユーザー操作ログのサンプルデータ
INSERT INTO user_logs (user_id, operation_code, operation, details, operated_at) VALUES
('user001', 'LOGIN', 'ログイン', 'IPアドレス: 192.168.1.1', '2025-05-01 10:00:00'),
('user002', 'MATCH', 'マッチング開始', 'ランダムマッチ', '2025-05-01 10:05:00'),
('user003', 'PROFILE', 'プロフィール更新', 'ニックネーム変更', '2025-05-01 10:10:00');

-- 基本サンプルデータ終了
-- 以下のファイルで追加データを提供：
-- - seed_daily_ranking.sql
-- - seed_match_history.sql
-- - seed_user_stats.sql 