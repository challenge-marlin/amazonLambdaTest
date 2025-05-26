INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user001', 153, 1, 18,
  36, 49, 42,
  'scissors', 'P:D,G:W,P:L,S:W,P:L',
  2, 7, 0,
  'title_001', 'title_004,title_003,title_004', 'skill', TRUE, TRUE,
  'silver', '2025-05-04'
FROM users u WHERE u.user_id = 'user001';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user002', 4, 1, 0,
  2, 48, 36,
  'scissors', 'S:W,S:L,P:D,S:D,P:L',
  10, 0, 3,
  'title_001', 'title_002,title_001,title_002', 'to', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user002';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user003', 70, 6, 2,
  24, 36, 50,
  'paper', 'S:L,P:L,G:D,P:W,P:W',
  9, 1, 0,
  'title_003', 'title_001,title_003', 'war', TRUE, TRUE,
  'no_rank', '2025-05-01'
FROM users u WHERE u.user_id = 'user003';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user004', 132, 3, 1,
  6, 9, 32,
  'paper', 'P:L,S:W,P:D,S:W,S:W',
  6, 8, 5,
  'title_003', 'title_005,title_001,title_004', 'away', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user004';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user005', 18, 6, 2,
  7, 8, 49,
  'paper', 'P:W,S:D,P:W,P:D,P:W',
  3, 2, 4,
  'title_002', 'title_005', 'nothing', TRUE, TRUE,
  'bronze', '2025-05-04'
FROM users u WHERE u.user_id = 'user005';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user006', 186, 1, 12,
  5, 10, 8,
  'scissors', 'G:D,S:L,G:W,G:D,P:W',
  5, 7, 3,
  'title_003', 'title_002', 'dinner', TRUE, TRUE,
  'gold', '2025-05-03'
FROM users u WHERE u.user_id = 'user006';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user007', 121, 1, 9,
  9, 12, 48,
  'paper', 'P:D,G:D,G:W,S:L,G:D',
  5, 0, 2,
  'title_001', 'title_003,title_002,title_002', 'computer', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user007';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user008', 148, 9, 14,
  37, 50, 28,
  'scissors', 'P:W,G:D,S:W,P:L,G:D',
  6, 4, 1,
  'title_001', 'title_001,title_005,title_004', '不屈の魔術師の残響', TRUE, TRUE,
  'gold', '2025-05-03'
FROM users u WHERE u.user_id = 'user008';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user009', 141, 6, 16,
  15, 4, 34,
  'paper', 'P:D,G:L,S:L,S:L,S:W',
  10, 7, 0,
  'title_001', 'title_005,title_003,title_001', 'far', TRUE, TRUE,
  'silver', '2025-05-04'
FROM users u WHERE u.user_id = 'user009';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user010', 112, 1, 11,
  2, 24, 44,
  'paper', 'G:L,P:L,P:L,S:L,P:L',
  3, 3, 2,
  'title_004', 'title_003,title_005', 'science', TRUE, TRUE,
  'bronze', '2025-05-04'
FROM users u WHERE u.user_id = 'user010';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user011', 48, 0, 13,
  32, 40, 46,
  'paper', 'P:D,S:L,S:L,G:L,G:W',
  3, 10, 2,
  'title_001', 'title_001', 'create', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user011';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user012', 24, 8, 19,
  11, 8, 16,
  'paper', 'G:D,P:L,G:W,S:W,S:L',
  0, 4, 4,
  'title_002', 'title_002', 'second', TRUE, TRUE,
  'no_rank', '2025-05-04'
FROM users u WHERE u.user_id = 'user012';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user013', 185, 2, 0,
  10, 4, 27,
  'paper', 'S:W,S:D,G:W,S:D,S:D',
  10, 4, 4,
  'title_002', 'title_003,title_001', 'myself', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user013';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user014', 83, 1, 16,
  18, 13, 16,
  'rock', 'S:L,S:L,G:L,P:L,S:L',
  10, 4, 5,
  'title_004', 'title_003', 'current', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user014';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user015', 17, 3, 3,
  0, 3, 5,
  'paper', 'G:L,S:D,G:L,G:W,S:L',
  9, 8, 0,
  'title_001', 'title_002,title_003', 'which', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user015';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user016', 158, 7, 0,
  14, 39, 41,
  'paper', 'P:W,S:L,S:D,S:D,G:W',
  0, 2, 3,
  'title_001', 'title_005,title_003,title_002', 'better', TRUE, TRUE,
  'no_rank', '2025-05-03'
FROM users u WHERE u.user_id = 'user016';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user017', 51, 1, 13,
  35, 44, 1,
  'scissors', 'P:L,G:D,S:D,P:D,P:W',
  10, 1, 3,
  'title_002', 'title_004,title_005', 'country', TRUE, TRUE,
  'silver', '2025-05-02'
FROM users u WHERE u.user_id = 'user017';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user018', 45, 8, 13,
  33, 0, 19,
  'rock', 'S:W,P:L,P:L,P:W,G:W',
  0, 0, 2,
  'title_002', 'title_003,title_001', 'far', TRUE, TRUE,
  'no_rank', '2025-05-06'
FROM users u WHERE u.user_id = 'user018';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user019', 45, 3, 8,
  45, 36, 25,
  'rock', 'S:W,G:L,G:L,G:W,P:W',
  6, 7, 2,
  'title_003', 'title_005,title_004,title_005', 'poor', TRUE, TRUE,
  'no_rank', '2025-05-03'
FROM users u WHERE u.user_id = 'user019';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user020', 99, 10, 3,
  44, 7, 42,
  'rock', 'S:L,S:L,P:D,G:W,S:W',
  3, 5, 5,
  'title_002', 'title_004,title_001', 'apply', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user020';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user021', 138, 0, 16,
  12, 28, 32,
  'paper', 'P:L,S:D,G:D,S:D,G:D',
  1, 5, 1,
  'title_002', 'title_002', 'help', TRUE, TRUE,
  'silver', '2025-05-02'
FROM users u WHERE u.user_id = 'user021';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user022', 12, 1, 1,
  39, 24, 28,
  'rock', 'G:D,S:L,G:D,S:W,G:L',
  7, 1, 5,
  'title_005', 'title_002', 'age', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user022';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user023', 150, 7, 1,
  44, 20, 35,
  'rock', 'P:L,S:W,G:L,S:D,G:W',
  2, 1, 4,
  'title_001', 'title_004,title_004', 'account', TRUE, TRUE,
  'bronze', '2025-05-05'
FROM users u WHERE u.user_id = 'user023';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user024', 37, 6, 12,
  28, 5, 41,
  'paper', 'P:L,P:D,P:D,S:W,G:W',
  7, 6, 0,
  'title_001', 'title_004,title_001', 'game', TRUE, TRUE,
  'bronze', '2025-05-05'
FROM users u WHERE u.user_id = 'user024';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user025', 182, 4, 9,
  46, 14, 25,
  'rock', 'G:L,P:D,G:W,S:W,S:L',
  2, 0, 4,
  'title_003', 'title_003,title_005,title_005', 'young', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user025';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user026', 112, 4, 12,
  34, 44, 16,
  'scissors', 'P:L,G:W,G:L,G:W,G:D',
  10, 7, 2,
  'title_003', 'title_002,title_005', 'our', TRUE, TRUE,
  'silver', '2025-05-03'
FROM users u WHERE u.user_id = 'user026';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user027', 158, 2, 7,
  29, 9, 17,
  'rock', 'G:W,P:L,S:W,P:D,P:D',
  6, 7, 2,
  'title_005', 'title_005,title_001', 'important', TRUE, TRUE,
  'bronze', '2025-05-05'
FROM users u WHERE u.user_id = 'user027';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user028', 155, 4, 9,
  23, 32, 18,
  'scissors', 'S:D,S:L,S:D,P:L,P:D',
  7, 4, 4,
  'title_001', 'title_002,title_002', 'edge', TRUE, TRUE,
  'gold', '2025-05-02'
FROM users u WHERE u.user_id = 'user028';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user029', 29, 9, 0,
  10, 0, 39,
  'paper', 'G:L,P:L,P:D,P:L,S:D',
  4, 10, 0,
  'title_004', 'title_004', 'true', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user029';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user030', 115, 2, 5,
  23, 34, 2,
  'scissors', 'S:W,P:L,S:W,S:W,G:L',
  10, 7, 5,
  'title_003', 'title_005,title_001', 'federal', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user030';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user031', 10, 4, 11,
  39, 46, 11,
  'scissors', 'P:W,G:W,G:D,P:W,P:L',
  1, 0, 1,
  'title_002', 'title_002,title_001', '不屈の意志', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user031';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user032', 44, 10, 10,
  40, 10, 46,
  'paper', 'G:W,G:W,P:L,P:D,G:W',
  7, 1, 2,
  'title_001', 'title_001', 'rest', TRUE, TRUE,
  'silver', '2025-05-02'
FROM users u WHERE u.user_id = 'user032';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user033', 87, 2, 8,
  0, 28, 1,
  'scissors', 'S:L,P:D,P:L,P:D,G:L',
  9, 9, 2,
  'title_003', 'title_005,title_002', 'majority', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user033';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user034', 9, 0, 7,
  15, 18, 16,
  'scissors', 'P:W,G:L,S:L,P:L,S:L',
  4, 3, 1,
  'title_004', 'title_003,title_003', 'within', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user034';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user035', 153, 8, 4,
  28, 30, 38,
  'paper', 'S:L,S:L,P:W,G:D,P:D',
  7, 3, 3,
  'title_001', 'title_003,title_002', 'although', TRUE, TRUE,
  'no_rank', '2025-05-04'
FROM users u WHERE u.user_id = 'user035';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user036', 151, 10, 4,
  41, 38, 9,
  'rock', 'S:W,S:W,S:W,G:D,G:L',
  5, 3, 2,
  'title_002', 'title_002', 'kid', TRUE, TRUE,
  'no_rank', '2025-05-02'
FROM users u WHERE u.user_id = 'user036';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user037', 184, 2, 0,
  11, 7, 22,
  'paper', 'S:L,S:D,P:D,G:L,G:D',
  2, 4, 5,
  'title_004', 'title_004,title_004,title_002', 'modern', TRUE, TRUE,
  'silver', '2025-05-03'
FROM users u WHERE u.user_id = 'user037';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user038', 49, 0, 13,
  23, 19, 29,
  'paper', 'S:D,P:W,S:W,S:W,P:D',
  8, 3, 4,
  'title_002', 'title_001', 'task', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user038';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user039', 88, 7, 2,
  5, 29, 2,
  'scissors', 'S:L,S:D,P:W,P:W,G:L',
  0, 7, 2,
  'title_003', 'title_003,title_003,title_001', 'fast', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user039';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user040', 74, 1, 9,
  39, 49, 9,
  'scissors', 'G:L,G:L,P:D,S:D,G:L',
  3, 0, 5,
  'title_003', 'title_001,title_003,title_002', 'church', TRUE, TRUE,
  'no_rank', '2025-05-05'
FROM users u WHERE u.user_id = 'user040';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user041', 40, 10, 6,
  31, 40, 7,
  'scissors', 'S:D,P:D,S:D,G:D,S:L',
  8, 8, 1,
  'title_005', 'title_004', 'either', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user041';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user042', 60, 6, 17,
  47, 8, 26,
  'rock', 'G:W,G:D,G:W,S:L,S:W',
  1, 9, 2,
  'title_004', 'title_004,title_004', 'travel', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user042';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user043', 167, 8, 14,
  45, 7, 28,
  'rock', 'S:L,S:W,P:D,S:L,P:W',
  9, 8, 3,
  'title_001', 'title_001,title_001', 'thank', TRUE, TRUE,
  'no_rank', '2025-05-03'
FROM users u WHERE u.user_id = 'user043';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user044', 163, 6, 2,
  46, 30, 20,
  'rock', 'G:D,S:L,S:D,G:W,S:D',
  9, 6, 0,
  'title_005', 'title_005', 'each', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user044';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user045', 187, 5, 2,
  9, 45, 44,
  'scissors', 'S:D,P:D,G:D,P:L,S:W',
  1, 10, 1,
  'title_001', 'title_002', 'recognize', TRUE, TRUE,
  'no_rank', '2025-05-04'
FROM users u WHERE u.user_id = 'user045';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user046', 112, 0, 1,
  18, 13, 39,
  'paper', 'S:W,S:W,S:D,P:W,G:W',
  1, 7, 4,
  'title_004', 'title_001', 'decade', TRUE, TRUE,
  'gold', '2025-05-03'
FROM users u WHERE u.user_id = 'user046';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user047', 85, 4, 5,
  50, 30, 7,
  'rock', 'P:L,P:D,S:L,S:W,S:W',
  5, 6, 0,
  'title_002', 'title_003,title_001', 'help', TRUE, TRUE,
  'bronze', '2025-05-05'
FROM users u WHERE u.user_id = 'user047';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user048', 112, 4, 14,
  5, 9, 47,
  'paper', 'S:D,P:W,S:W,S:L,S:W',
  4, 1, 5,
  'title_002', 'title_003,title_004', 'yard', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user048';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user049', 184, 1, 17,
  49, 35, 46,
  'rock', 'P:L,S:L,S:D,S:D,G:D',
  2, 7, 2,
  'title_003', 'title_005,title_003,title_004', 'clear', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user049';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user050', 83, 7, 13,
  40, 25, 8,
  'rock', 'P:W,G:D,G:D,G:W,P:D',
  0, 1, 1,
  'title_004', 'title_002', 'individual', TRUE, TRUE,
  'no_rank', '2025-05-02'
FROM users u WHERE u.user_id = 'user050';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user051', 199, 10, 11,
  15, 40, 28,
  'scissors', 'S:D,G:W,G:L,S:D,G:W',
  0, 7, 4,
  'title_004', 'title_005,title_001', 'again', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user051';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user052', 94, 1, 6,
  37, 40, 25,
  'scissors', 'G:W,G:L,P:D,P:W,P:L',
  4, 7, 5,
  'title_005', 'title_005', 'person', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user052';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user053', 181, 2, 15,
  38, 30, 28,
  'rock', 'S:L,G:W,P:L,S:W,S:L',
  7, 2, 0,
  'title_001', 'title_003,title_004', 'structure', TRUE, TRUE,
  'gold', '2025-05-06'
FROM users u WHERE u.user_id = 'user053';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user054', 162, 10, 19,
  30, 29, 30,
  'rock', 'G:W,S:D,S:L,P:W,P:W',
  0, 4, 4,
  'title_001', 'title_001', 'two', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user054';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user055', 27, 5, 19,
  4, 15, 11,
  'scissors', 'G:L,G:D,P:W,S:D,G:W',
  2, 10, 0,
  'title_001', 'title_001,title_004', 'size', TRUE, TRUE,
  'no_rank', '2025-05-01'
FROM users u WHERE u.user_id = 'user055';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user056', 2, 2, 16,
  45, 25, 26,
  'rock', 'S:D,G:W,P:D,P:L,P:D',
  1, 3, 5,
  'title_003', 'title_005', 'fact', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user056';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user057', 88, 5, 0,
  28, 10, 42,
  'paper', 'P:D,P:D,S:W,G:W,G:D',
  0, 5, 3,
  'title_002', 'title_005,title_004,title_001', 'stay', TRUE, TRUE,
  'silver', '2025-05-04'
FROM users u WHERE u.user_id = 'user057';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user058', 135, 8, 5,
  3, 44, 20,
  'scissors', 'G:D,S:L,G:L,G:D,G:D',
  3, 6, 4,
  'title_002', 'title_001,title_003,title_004', 'weight', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user058';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user059', 49, 10, 7,
  12, 10, 13,
  'paper', 'S:W,P:D,P:D,S:L,G:W',
  5, 1, 5,
  'title_003', 'title_001', 'will', TRUE, TRUE,
  'silver', '2025-05-03'
FROM users u WHERE u.user_id = 'user059';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user060', 174, 3, 16,
  50, 48, 42,
  'rock', 'G:W,G:D,G:D,P:W,S:D',
  2, 10, 0,
  'title_005', 'title_004', 'word', TRUE, TRUE,
  'no_rank', '2025-05-06'
FROM users u WHERE u.user_id = 'user060';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user061', 45, 5, 11,
  13, 1, 10,
  'rock', 'P:W,S:W,G:W,S:L,P:L',
  9, 4, 3,
  'title_004', 'title_005,title_004', 'blue', TRUE, TRUE,
  'bronze', '2025-05-02'
FROM users u WHERE u.user_id = 'user061';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user062', 157, 3, 16,
  46, 31, 50,
  'paper', 'P:W,S:L,S:W,P:D,P:W',
  3, 0, 2,
  'title_005', 'title_005,title_005,title_004', 'may', TRUE, TRUE,
  'bronze', '2025-05-01'
FROM users u WHERE u.user_id = 'user062';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user063', 35, 7, 19,
  22, 2, 23,
  'paper', 'G:L,G:L,S:D,P:D,S:L',
  10, 5, 1,
  'title_001', 'title_001,title_002,title_003', 'here', TRUE, TRUE,
  'bronze', '2025-05-04'
FROM users u WHERE u.user_id = 'user063';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user064', 59, 3, 2,
  30, 17, 21,
  'rock', 'P:W,G:W,P:D,G:W,S:D',
  4, 0, 1,
  'title_004', 'title_001', 'step', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user064';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user065', 151, 7, 4,
  13, 32, 23,
  'scissors', 'S:L,G:L,P:D,S:D,P:L',
  8, 6, 5,
  'title_002', 'title_005,title_003', 'when', TRUE, TRUE,
  'no_rank', '2025-05-04'
FROM users u WHERE u.user_id = 'user065';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user066', 71, 5, 2,
  27, 25, 13,
  'rock', 'P:L,S:L,P:L,S:L,S:L',
  9, 1, 3,
  'title_004', 'title_004,title_001', 'executive', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user066';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user067', 116, 2, 6,
  35, 39, 35,
  'scissors', 'G:D,S:L,G:W,S:D,P:L',
  10, 10, 0,
  'title_004', 'title_001', 'process', TRUE, TRUE,
  'bronze', '2025-05-04'
FROM users u WHERE u.user_id = 'user067';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user068', 119, 0, 4,
  21, 29, 31,
  'paper', 'G:L,G:W,P:L,S:W,G:D',
  9, 10, 4,
  'title_001', 'title_004,title_005,title_001', 'gas', TRUE, TRUE,
  'no_rank', '2025-05-01'
FROM users u WHERE u.user_id = 'user068';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user069', 188, 6, 11,
  11, 35, 30,
  'scissors', 'P:L,P:D,G:W,G:D,P:W',
  5, 5, 3,
  'title_003', 'title_004,title_003', 'explain', TRUE, TRUE,
  'no_rank', '2025-05-06'
FROM users u WHERE u.user_id = 'user069';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user070', 134, 1, 3,
  38, 42, 33,
  'scissors', 'P:L,G:L,G:W,G:L,P:L',
  2, 9, 5,
  'title_004', 'title_002,title_003', 'add', TRUE, TRUE,
  'bronze', '2025-05-03'
FROM users u WHERE u.user_id = 'user070';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user071', 176, 7, 15,
  4, 10, 5,
  'scissors', 'S:D,P:W,G:L,P:D,S:W',
  9, 7, 0,
  'title_004', 'title_002,title_005', 'form', TRUE, TRUE,
  'gold', '2025-05-02'
FROM users u WHERE u.user_id = 'user071';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user072', 0, 7, 17,
  25, 29, 11,
  'scissors', 'G:W,S:L,S:W,P:L,S:L',
  6, 3, 3,
  'title_001', 'title_002,title_005,title_003', 'sit', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user072';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user073', 126, 7, 7,
  37, 42, 44,
  'paper', 'P:D,G:W,P:D,G:W,S:D',
  3, 3, 4,
  'title_002', 'title_003,title_004,title_005', 'main', TRUE, TRUE,
  'no_rank', '2025-05-01'
FROM users u WHERE u.user_id = 'user073';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user074', 194, 5, 8,
  6, 48, 49,
  'paper', 'G:D,G:W,P:L,G:W,G:W',
  1, 9, 3,
  'title_003', 'title_005', 'magazine', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user074';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user075', 47, 0, 17,
  13, 12, 23,
  'paper', 'G:D,P:D,S:D,S:W,G:W',
  5, 10, 5,
  'title_002', 'title_004', 'still', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user075';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user076', 153, 9, 4,
  4, 20, 14,
  'scissors', 'P:L,S:L,P:D,S:W,G:W',
  1, 2, 1,
  'title_005', 'title_002', 'anything', TRUE, TRUE,
  'bronze', '2025-05-06'
FROM users u WHERE u.user_id = 'user076';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user077', 158, 5, 0,
  39, 39, 1,
  'rock', 'S:D,P:L,S:L,S:L,S:W',
  9, 8, 3,
  'title_004', 'title_005,title_004,title_004', 'million', TRUE, TRUE,
  'bronze', '2025-05-06'
FROM users u WHERE u.user_id = 'user077';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user078', 70, 7, 8,
  11, 50, 8,
  'scissors', 'P:D,P:D,P:W,P:D,S:L',
  3, 9, 1,
  'title_002', 'title_003', 'middle', TRUE, TRUE,
  'no_rank', '2025-05-03'
FROM users u WHERE u.user_id = 'user078';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user079', 48, 10, 2,
  34, 28, 3,
  'rock', 'P:W,G:L,G:D,P:W,S:L',
  9, 0, 5,
  'title_001', 'title_001,title_003', 'west', TRUE, TRUE,
  'gold', '2025-05-06'
FROM users u WHERE u.user_id = 'user079';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user080', 133, 8, 0,
  15, 8, 4,
  'rock', 'G:W,G:L,S:W,S:L,P:D',
  4, 10, 4,
  'title_001', 'title_002,title_005', 'and', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user080';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user081', 6, 4, 10,
  33, 48, 23,
  'scissors', 'P:L,G:D,P:W,S:W,G:L',
  8, 6, 0,
  'title_004', 'title_002,title_001,title_004', 'source', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user081';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user082', 20, 9, 10,
  34, 7, 12,
  'rock', 'S:W,S:W,S:D,G:L,S:D',
  6, 6, 0,
  'title_005', 'title_005,title_004,title_003', 'life', TRUE, TRUE,
  'gold', '2025-05-03'
FROM users u WHERE u.user_id = 'user082';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user083', 83, 3, 15,
  30, 1, 11,
  'rock', 'P:W,P:D,P:L,P:W,S:W',
  1, 7, 4,
  'title_004', 'title_002,title_002', 'point', TRUE, TRUE,
  'silver', '2025-05-04'
FROM users u WHERE u.user_id = 'user083';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user084', 37, 7, 8,
  5, 24, 44,
  'paper', 'S:D,G:L,S:D,S:L,S:D',
  4, 1, 0,
  'title_003', 'title_004', 'partner', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user084';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user085', 122, 8, 13,
  35, 43, 32,
  'scissors', 'P:W,P:D,G:D,G:L,P:W',
  4, 2, 3,
  'title_002', 'title_001,title_002', 'gas', TRUE, TRUE,
  'bronze', '2025-05-04'
FROM users u WHERE u.user_id = 'user085';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user086', 58, 3, 4,
  3, 16, 2,
  'scissors', 'G:L,G:W,P:W,S:W,S:L',
  3, 0, 2,
  'title_001', 'title_005,title_004,title_001', 'discover', TRUE, TRUE,
  'bronze', '2025-05-03'
FROM users u WHERE u.user_id = 'user086';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user087', 55, 9, 16,
  7, 10, 11,
  'paper', 'P:D,G:D,S:L,G:D,P:W',
  7, 8, 0,
  'title_004', 'title_005', 'although', TRUE, TRUE,
  'bronze', '2025-05-06'
FROM users u WHERE u.user_id = 'user087';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user088', 32, 9, 10,
  39, 34, 28,
  'rock', 'G:D,G:D,S:W,G:D,G:D',
  7, 4, 4,
  'title_002', 'title_003,title_002,title_004', 'particular', TRUE, TRUE,
  'gold', '2025-05-05'
FROM users u WHERE u.user_id = 'user088';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user089', 63, 2, 20,
  47, 46, 30,
  'rock', 'P:W,P:D,S:W,P:D,G:D',
  7, 3, 5,
  'title_005', 'title_002', 'bag', TRUE, TRUE,
  'silver', '2025-05-02'
FROM users u WHERE u.user_id = 'user089';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user090', 31, 7, 4,
  38, 27, 29,
  'rock', 'P:L,P:W,G:W,G:W,S:D',
  3, 9, 1,
  'title_004', 'title_003', 'month', TRUE, TRUE,
  'silver', '2025-05-06'
FROM users u WHERE u.user_id = 'user090';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user091', 128, 9, 20,
  31, 41, 14,
  'scissors', 'P:L,S:L,G:D,S:L,P:L',
  7, 10, 4,
  'title_004', 'title_002,title_002,title_002', 'military', TRUE, TRUE,
  'bronze', '2025-05-06'
FROM users u WHERE u.user_id = 'user091';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user092', 111, 4, 11,
  28, 21, 30,
  'paper', 'P:D,S:D,G:W,S:D,P:L',
  10, 3, 5,
  'title_003', 'title_001,title_001,title_002', 'responsibility', TRUE, TRUE,
  'silver', '2025-05-04'
FROM users u WHERE u.user_id = 'user092';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user093', 83, 4, 7,
  40, 45, 10,
  'scissors', 'G:W,S:L,P:W,S:D,S:W',
  6, 7, 3,
  'title_002', 'title_005,title_001,title_003', 'out', TRUE, TRUE,
  'no_rank', '2025-05-05'
FROM users u WHERE u.user_id = 'user093';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user094', 4, 3, 19,
  31, 45, 11,
  'scissors', 'S:L,G:L,P:W,S:L,G:D',
  0, 0, 0,
  'title_004', 'title_003', 'a', TRUE, TRUE,
  'gold', '2025-05-01'
FROM users u WHERE u.user_id = 'user094';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user095', 59, 2, 16,
  17, 1, 5,
  'rock', 'P:L,G:W,G:W,S:L,P:D',
  9, 7, 0,
  'title_002', 'title_001,title_004,title_001', 'cold', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user095';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user096', 95, 5, 19,
  13, 0, 9,
  'rock', 'S:W,P:L,P:W,G:L,P:L',
  9, 4, 2,
  'title_004', 'title_005,title_001', 'price', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user096';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user097', 6, 5, 8,
  8, 21, 10,
  'scissors', 'S:L,P:W,P:W,G:D,P:D',
  2, 4, 2,
  'title_001', 'title_005,title_002', 'skill', TRUE, TRUE,
  'silver', '2025-05-05'
FROM users u WHERE u.user_id = 'user097';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user098', 116, 7, 11,
  18, 0, 6,
  'rock', 'S:L,G:L,S:D,P:L,G:D',
  6, 8, 2,
  'title_001', 'title_002,title_005', 'should', TRUE, TRUE,
  'gold', '2025-05-04'
FROM users u WHERE u.user_id = 'user098';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user099', 122, 8, 13,
  38, 6, 45,
  'paper', 'G:W,S:L,P:D,P:W,P:W',
  8, 7, 4,
  'title_002', 'title_003,title_004', 'their', TRUE, TRUE,
  'bronze', '2025-05-06'
FROM users u WHERE u.user_id = 'user099';

INSERT INTO user_stats (
  management_code, user_id, total_wins, current_win_streak, max_win_streak,
  hand_stats_rock, hand_stats_scissors, hand_stats_paper,
  favorite_hand, recent_hand_results_str,
  daily_wins, daily_losses, daily_draws,
  title, available_titles, alias, show_title, show_alias,
  user_rank, last_reset_at
)
SELECT
  u.management_code, 'user100', 25, 7, 13,
  33, 48, 35,
  'scissors', 'G:W,P:L,S:D,G:W,P:D',
  9, 6, 2,
  'title_003', 'title_003', 'mother', TRUE, TRUE,
  'silver', '2025-05-01'
FROM users u WHERE u.user_id = 'user100';