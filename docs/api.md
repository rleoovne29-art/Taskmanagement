# API仕様書

[要件定義書に戻る](./requirements.md)

## エンドポイント一覧

| メソッド | パス | 内容 |
|----------|------|------|
| GET | /api/cards | カードを取得する。任意のクエリ `keyword`（タイトル部分一致・大文字小文字無視）、`status`（TODO/DOING/DONE）、`priority`（HIGH/MEDIUM/LOW）で絞り込める。未指定なら全件 |
| GET | /api/cards/:id | 指定したカードを1件取得する（存在しない場合は404） |
| POST | /api/cards | 新しいカードを作成する（タスク名・期限日・優先度・列を指定） |
| PUT | /api/cards/:id | 指定したカードの内容（タスク名・期限日・優先度・列）を更新する |
| DELETE | /api/cards/:id | 指定したカードを削除する |

## POST /api/cards（新規登録）

リクエストボディ（JSON）:

| 項目 | 必須 | 内容 |
|------|------|------|
| title | 必須 | タスク名（空白のみ不可・255文字以内。前後の空白は除去して保存） |
| dueDate | 任意 | 期限日（`yyyy-MM-dd`）。未指定なら期限なし |
| priority | 任意 | `HIGH` / `MEDIUM` / `LOW`。未指定なら `MEDIUM` |
| status | 任意 | `TODO` / `DOING` / `DONE`。未指定なら `TODO` |

- 成功時は `201 Created` と作成したカード（id・createdAt などを含む）を返す
- 入力不備は `400 Bad Request`（`fieldErrors` に項目ごとのメッセージ）
- `PUT /api/cards/:id` でも `status` は任意で、未指定なら現在の列を維持する

## 補足
- カードの移動も`PUT /api/cards/:id`で列（status）を書き換えることで実現する（専用エンドポイントは設けない）
- レスポンスはJSON形式で返す

データモデルの詳細は[データベース設計書](./database.md)を参照。
