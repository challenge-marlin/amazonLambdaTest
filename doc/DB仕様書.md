
# データベース仕様書（修正20250502）

## テーブル一覧
- **admin_logs**：管理者オペレーションログ  
- **daily_ranking**：デイリーランキング  
- **match_history**：マッチング結果（履歴）  
- **registration_itemdata**：ユーザー端末識別情報  
- **users**：ユーザー情報  
- **user_logs**：ユーザー操作ログ  
- **user_stats**：ユーザー状態  

---

## テーブル詳細

### 1. admin_logs（管理者オペレーションログ）
管理者の操作履歴を記録するテーブル

| カラム名      | 型                    | NULL許可 | デフォルト            | 説明                       |
|-------------|-----------------------|---------|-----------------------|--------------------------|
| log_id      | BIGINT AUTO_INCREMENT | NO (PK) |                       | ログID（主キー）              |
| admin_user  | VARCHAR(50)           | NO      |                       | 管理者ユーザー名             |
| operation   | VARCHAR(100)          | NO      |                       | 操作内容                   |
| target_id   | VARCHAR(36)           | NO      |                       | 対象エンティティID           |
| details     | TEXT                  | YES     |                       | 詳細                       |
| operated_at | DATETIME              | NO      | CURRENT_TIMESTAMP     | 操作日時                   |

---

## daily_ranking（デイリーランキング）

| 論理名        | カラム名          | データ型     | NOT NULL | デフォルト                                      | 備考             |
|-------------|------------------|------------|-----------|-----------------------------------------------|----------------|
| ランキング順位   | ranking_position | INT        | YES (PK)  |                                               | 主キー           |
| ユーザーID    | user_id          | VARCHAR(36) | YES       |                                               |                 |
| 勝利数       | wins             | INT        | NO        |                                               | NULL許可         |
| 最終勝利日時   | last_win_at      | DATETIME   | NO        |                                               |                 |
| 更新日時     | updated_at       | DATETIME   | NO        | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新自動更新       |

---


### 3. match_history（マッチング結果）
じゃんけん対戦の結果履歴を管理するテーブル

| カラム名       | 物理名         | 型                           | NULL許可 | デフォルト                   | 説明                                     |
|--------------|--------------|-----------------------------|---------|----------------------------|----------------------------------------|
| 戦い番号       | fight_no     | BIGINT AUTO_INCREMENT       | NO (PK) |                            | 対戦一意ID                                 |
| ユーザー１番    | player1_id   | VARCHAR(36)                 | NO      |                            | プレイヤー1のユーザーID                      |
| ユーザー２番    | player2_id   | VARCHAR(36)                 | NO      |                            | プレイヤー2のユーザーID                      |
| プレイヤー1の手  | player1_hand | ENUM('rock','paper','scissors') | NO      |                            | プレイヤー1が出した手                         |
| プレイヤー2の手  | player2_hand | ENUM('rock','paper','scissors') | NO      |                            | プレイヤー2が出した手                         |
| プレイヤー1結果  | player1_result | ENUM('win','lose','draw')   | NO      |                            | プレイヤー1の対戦結果                         |
| プレイヤー2結果  | player2_result | ENUM('win','lose','draw')   | NO      |                            | プレイヤー2の対戦結果                         |
| 勝者           | winner       | TINYINT UNSIGNED            | NO      | 0                          | 0:未決、1:player1勝利、2:player2勝利、3:引き分け |
| 引き分け回数     | draw_count   | INT                         | NO      | 0                          | 引き分け回数                                |
| マッチングタイプ  | match_type   | ENUM('random','friend')     | NO      |                            | マッチング方式                              |
| 生成日時        | created_at   | DATETIME(3)                 | NO      | CURRENT_TIMESTAMP(3)       | 対戦生成日時                               |
| 確定日時        | finished_at  | DATETIME(3)                 | YES     |                            | 対戦確定日時                               |

#### インデックス
- **idx_p1**: (player1_id)  
- **idx_p2**: (player2_id)  
- **idx_p1_result**: (player1_id, player1_result)  
- **idx_p2_result**: (player2_id, player2_result)  

#### 外部キー
- player1_id → users(user_id)  
- player2_id → users(user_id)  

---

### 4. registration_itemdata（ユーザー端末識別情報）
ユーザーが利用する端末情報を管理するテーブル

| カラム名         | 物理名           | 型             | NULL許可    | デフォルト | 説明                         |
|----------------|----------------|---------------|-----------|----------|----------------------------|
| ユーザー管理番号   | management_code | BIGINT        | NO (PK)   |          | ユーザー管理コード               |
| 枝番            | subnum         | INT           | NO (PK)   | 1        | 同一ユーザー内での連番            |
| デバイス種       | itemtype       | TINYINT       | NO        | 0        | 0:スマホ以外,1:iOS,2:Android |
| デバイス識別ID    | itemid         | DATETIME      | NO        |          | 端末固有識別子                  |
| created_at     | DATETIME       | NO        | CURRENT_TIMESTAMP | 作成日時                      |

#### 主キー
- (management_code, subnum)  

#### 外部キー
- management_code → users(management_code)  

---

## users（ユーザー情報）

| 論理名             | カラム名                 | データ型                | NOT NULL | デフォルト                                      | 備考                                       |
|------------------|------------------------|-----------------------|-----------|-----------------------------------------------|------------------------------------------|
| 管理コード          | management_code        | BIGINT AUTO_INCREMENT | YES (PK)  |                                               | 主キー、自動採番                              |
| ユーザーID         | user_id                | VARCHAR(36)           | YES       |                                               | 一意識別子                                   |
| 電子メール          | email                  | VARCHAR(255)          | YES       |                                               |                                             |
| パスワード          | password               | VARCHAR(255)          | NO        |                                               | ハッシュ化パスワード                             |
| 名前              | name                   | VARCHAR(50)           | YES       |                                               |                                             |
| ニックネーム        | nickname               | VARCHAR(50)           | YES       |                                               | ※ 必須項目に修正                                |
| 郵便番号           | postal_code            | VARCHAR(10)           | YES       |                                               |                                             |
| 住所              | address                | VARCHAR(255)          | YES       |                                               |                                             |
| 電話番号           | phone_number           | VARCHAR(15)           | YES       |                                               |                                             |
| 学校名            | university             | VARCHAR(100)          | YES       |                                               |                                             |
| 生年月日           | birthdate              | DATE                  | YES       |                                               |                                             |
| プロフィール写真URL  | profile_image_url      | VARCHAR(255)          | NO        |                                               |                                             |
| 学生証イメージURL    | student_id_image_url   | VARCHAR(255)          | NO        |                                               |                                             |
| 生成日            | created_at             | DATETIME              | YES       | CURRENT_TIMESTAMP                             | レコード作成日時                                 |
| 更新日            | updated_at             | DATETIME              | YES       | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | レコード更新日時                                 |
| 登録種別           | register_type          | VARCHAR(20)           | YES       | 'email'                                       | email / google / line / apple               |
| 学生か            | is_student_id_editable | TINYINT               | YES       | 0                                             | 0: 編集不可、1: 編集可                          |
| BAN状態          | is_banned              | TINYINT               | YES       | 0                                             | 0:未設定、1:設定、2:復帰                        |


### インデックス

| インデックス名    | カラム     | ユニーク |
|------------------|----------|--------|
| idx_user_id      | user_id  | NO     |

---

### 6. user_logs（ユーザー操作ログ）
ユーザーの操作イベントを時系列で記録するテーブル

| カラム名         | 物理名         | 型                    | NULL許可 | デフォルト | 説明                                |
|----------------|--------------|-----------------------|---------|----------|-----------------------------------|
| log_id         | BIGINT AUTO_INCREMENT | NO (PK)       |         |          | ログID（主キー）                         |
| user_id        | VARCHAR(36)   | NO                    | ''       | ユーザー無関係通知時は空文字             |
| operation_code | VARCHAR(10)   | YES                   |          | 操作コード                             |
| operation      | VARCHAR(100)  | YES                   |          | 操作内容                               |
| details        | TEXT          | YES                   |          | 詳細説明                               |
| operated_at    | DATETIME      | NO                    | CURRENT_TIMESTAMP | 操作日時                     |

#### インデックス
- **idx_user_logs_uid**: (user_id)  

#### 外部キー
- user_id → users(user_id)  

---


## user_stats（ユーザー状態）

| 論理名               | カラム名                      | データ型   | NOT NULL | デフォルト      | 備考                                               |
|--------------------|-----------------------------|----------|-----------|----------------|--------------------------------------------------|
| 管理コード             | management_code             | BIGINT   | YES       |                | 一意キー（内部識別）                                     |
| ユーザーID            | user_id                     | VARCHAR  | YES       |                | ユーザー識別子                                        |
| 通算勝利数            | total_wins                  | INT      | YES       | 0              | 通算の勝利数                                           |
| 現在の連勝数          | current_win_streak          | INT      | YES       | 0              | 現在の連勝数                                           |
| 最大連勝数            | max_win_streak              | INT      | YES       | 0              | 記録された最大連勝数                                       |
| グーの出数           | hand_stats_rock             | INT      | YES       | 0              | グーの出数                                             |
| チョキの出数          | hand_stats_scissors         | INT      | YES       | 0              | チョキの出数                                            |
| パーの出数           | hand_stats_paper            | INT      | YES       | 0              | パーの出数                                             |
| お気に入りの手         | favorite_hand               | VARCHAR  | NO        | NULL           | 最も多く出した手（例：'rock'）                                |
| 直近の5手と勝敗        | recent_hand_results_str     | VARCHAR  | NO        | ''             | 例："G:W,P:D,S:L"（グー勝ち、パーあいこ、チョキ負け）               |
| 当日勝利数            | daily_wins                  | INT      | YES       | 0              | 当日の勝利数                                           |
| 当日敗北数            | daily_losses                | INT      | YES       | 0              | 当日の敗北数                                           |
| 当日引き分け数         | daily_draws                 | INT      | YES       | 0              | 当日の引き分け数                                         |
| 称号                | title                       | VARCHAR  | NO        | ''             | 現在表示中の称号                                         |
| 称号リスト             | available_titles            | VARCHAR  | YES       | ''             | 獲得済み称号IDのCSV（例: 'title_001,title_003'）               |
| 二つ名               | alias                       | VARCHAR  | NO        | ''             | 現在表示中の二つ名                                         |
| 称号表示              | show_title                  | BOOLEAN  | YES       | TRUE           | 称号を他者に見せるか                                      |
| 二つ名表示            | show_alias                  | BOOLEAN  | YES       | TRUE           | 二つ名を他者に見せるか                                     |
| ユーザーランク         | user_rank                   | VARCHAR  | YES       | 'no_rank'      | 表示・報酬用のランク                                      |
| リセット日           | last_reset_at              | DATE     | NO        |                | 日次リセット日時                                         |

---
