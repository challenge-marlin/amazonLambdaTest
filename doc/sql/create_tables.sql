-- データベース作成
CREATE DATABASE IF NOT EXISTS userdb;
USE userdb;

-- admin_logs（管理者オペレーションログ）
CREATE TABLE IF NOT EXISTS admin_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user VARCHAR(50) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    details TEXT,
    operated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- daily_ranking（デイリーランキング）
CREATE TABLE IF NOT EXISTS daily_ranking (
    ranking_position INT PRIMARY KEY,
    user_id VARCHAR(36),
    wins INT,
    last_win_at DATETIME,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- match_history（マッチング結果）
CREATE TABLE IF NOT EXISTS match_history (
    fight_no BIGINT AUTO_INCREMENT PRIMARY KEY,
    player1_id VARCHAR(36) NOT NULL,
    player2_id VARCHAR(36) NOT NULL,
    player1_hand ENUM('rock','paper','scissors') NOT NULL,
    player2_hand ENUM('rock','paper','scissors') NOT NULL,
    player1_result ENUM('win','lose','draw') NOT NULL,
    player2_result ENUM('win','lose','draw') NOT NULL,
    winner TINYINT UNSIGNED NOT NULL DEFAULT 0,
    draw_count INT NOT NULL DEFAULT 0,
    match_type ENUM('random','friend') NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    finished_at DATETIME(3),
    INDEX idx_p1 (player1_id),
    INDEX idx_p2 (player2_id),
    INDEX idx_p1_result (player1_id, player1_result),
    INDEX idx_p2_result (player2_id, player2_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- users（ユーザー情報）
CREATE TABLE IF NOT EXISTS users (
    management_code BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    nickname VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10),
    address VARCHAR(255),
    phone_number VARCHAR(15),
    university VARCHAR(100),
    birthdate DATE,
    profile_image_url VARCHAR(255) NOT NULL,
    student_id_image_url VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    register_type VARCHAR(20) DEFAULT 'email',
    is_student_id_editable TINYINT DEFAULT 0,
    is_banned TINYINT DEFAULT 0,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- registration_itemdata（ユーザー端末識別情報）
CREATE TABLE IF NOT EXISTS registration_itemdata (
    management_code BIGINT NOT NULL,
    subnum INT NOT NULL DEFAULT 1,
    itemtype TINYINT NOT NULL DEFAULT 0,
    itemid DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (management_code, subnum),
    FOREIGN KEY (management_code) REFERENCES users(management_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_logs（ユーザー操作ログ）
CREATE TABLE IF NOT EXISTS user_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL DEFAULT '',
    operation_code VARCHAR(10),
    operation VARCHAR(100),
    details TEXT,
    operated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_logs_uid (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- user_stats（ユーザー状態）
CREATE TABLE IF NOT EXISTS user_stats (
    management_code BIGINT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    total_wins INT DEFAULT 0,
    current_win_streak INT DEFAULT 0,
    max_win_streak INT DEFAULT 0,
    hand_stats_rock INT DEFAULT 0,
    hand_stats_scissors INT DEFAULT 0,
    hand_stats_paper INT DEFAULT 0,
    favorite_hand VARCHAR(10),
    recent_hand_results_str VARCHAR(255) DEFAULT '',
    daily_wins INT DEFAULT 0,
    daily_losses INT DEFAULT 0,
    daily_draws INT DEFAULT 0,
    title VARCHAR(50) DEFAULT '',
    available_titles VARCHAR(255) DEFAULT '',
    alias VARCHAR(50) DEFAULT '',
    show_title BOOLEAN DEFAULT TRUE,
    show_alias BOOLEAN DEFAULT TRUE,
    user_rank VARCHAR(20) DEFAULT 'no_rank',
    last_reset_at DATE NOT NULL,
    PRIMARY KEY (management_code),
    FOREIGN KEY (management_code) REFERENCES users(management_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 