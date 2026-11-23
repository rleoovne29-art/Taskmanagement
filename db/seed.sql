-- 開発用テストデータ。何度実行しても同じ状態に戻る(cardsを空にして再投入)。
-- 事前にバックエンドを一度起動し、cardsテーブルが作成されている必要がある。
-- enumはJPA(EnumType.STRING)に合わせて大文字で保存する。
TRUNCATE TABLE cards RESTART IDENTITY;

INSERT INTO cards (title, due_date, priority, status, created_at, updated_at) VALUES
  ('要件定義書をレビューする',   CURRENT_DATE + 3,  'HIGH',   'TODO',  now(), now()),
  ('画面モックを作成する',       CURRENT_DATE + 7,  'MEDIUM', 'TODO',  now(), now()),
  ('買い物リストを整理する',     NULL,              'LOW',    'TODO',  now(), now()),
  ('バックエンドAPIを実装する',  CURRENT_DATE + 1,  'HIGH',   'DOING', now(), now()),
  ('DB設計書を更新する',         CURRENT_DATE + 5,  'MEDIUM', 'DOING', now(), now()),
  ('開発環境を構築する',         CURRENT_DATE - 7,  'HIGH',   'DONE',  now(), now()),
  ('GitHubリポジトリを作成する', CURRENT_DATE - 10, 'MEDIUM', 'DONE',  now(), now()),
  ('READMEを書く',               NULL,              'LOW',    'DONE',  now(), now());
