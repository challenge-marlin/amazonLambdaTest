-- 既存のuser_statsデータを削除
DELETE FROM user_stats;

-- 5人の基本ユーザーのデータを挿入
INSERT INTO user_stats (
    management_code,
    user_id,
    total_wins,
    current_win_streak,
    max_win_streak,
    hand_stats_rock,
    hand_stats_scissors,
    hand_stats_paper,
    favorite_hand,
    recent_hand_results_str,
    daily_wins,
    daily_losses,
    daily_draws,
    title,
    available_titles,
    alias,
    show_title,
    show_alias,
    user_rank,
    last_reset_at
) VALUES 
-- user001: ベテランプレイヤー（シルバーランク）
(1, 'user001', 153, 1, 18,
 36, 49, 42,
 'scissors', 'P:D,G:W,P:L,S:W,P:L',
 2, 7, 0,
 'title_001', 'title_001,title_003,title_004', 'skill', TRUE, TRUE,
 'silver', '2025-05-04'),

-- user002: 新人プレイヤー（ブロンズランク）
(2, 'user002', 4, 1, 0,
 2, 48, 36,
 'scissors', 'S:W,S:L,P:D,S:D,P:L',
 10, 0, 3,
 'title_002', 'title_002,title_001,title_002', 'to', TRUE, TRUE,
 'bronze', '2025-05-05'),

-- user003: 上級者（ゴールドランク）
(3, 'user003', 70, 6, 2,
 24, 36, 50,
 'paper', 'S:L,P:L,G:D,P:W,P:W',
 9, 1, 0,
 'title_003', 'title_001,title_003', 'war', TRUE, TRUE,
 'gold', '2025-05-01'),

-- user030: 中級者（シルバーランク）
(4, 'user004', 115, 2, 5,
 23, 34, 2,
 'scissors', 'S:W,P:L,S:W,S:W,G:L',
 10, 7, 5,
 'title_003', 'title_005,title_003', 'federal', TRUE, TRUE,
 'silver', '2025-05-06'),

-- user005: 初心者（ノーランク）
(5, 'user005', 18, 6, 2,
 7, 8, 49,
 'paper', 'P:W,S:D,P:W,P:D,P:W',
 3, 2, 4,
 'title_002', 'title_001,title_002', 'nothing', TRUE, TRUE,
 'no_rank', '2025-05-04');
