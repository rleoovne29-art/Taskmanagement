# Taskmanagement

Trello風のタスク管理アプリ。カードを「To Do / Doing / Done」の3列ボードで管理する。
プログラミングスクールの学習課題として、フロントエンド・バックエンド・データベースの3層アーキテクチャを一から構築することを目的としている（ローカル環境での個人利用が前提）。

## 目次
- [機能](#機能)
- [実装状況](#実装状況)
- [システム構成](#システム構成)
- [技術スタック](#技術スタック)
- [ディレクトリ構成](#ディレクトリ構成)
- [セットアップと起動](#セットアップと起動)
- [バックエンド（backend/）](#バックエンドbackend)
- [フロントエンド（frontend/）](#フロントエンドfrontend)
- [開発ルール](#開発ルール)
- [ドキュメント](#ドキュメント)

## 機能
要件定義上のMVP（11機能）。詳細と受け入れ基準は [機能一覧](./docs/features.md) を参照。

1. 列の表示（To Do / Doing / Done）
2. カード追加
3. カード削除
4. カード移動（ドラッグ&ドロップ / ボタン）
5. データ保存（PostgreSQL。リロードしても復元）
6. カード編集
7. 期限日
8. 優先度（高・中・低、色分け表示）
9. バックエンドAPI（REST）
10. データベース（PostgreSQL）
11. 並び替え（優先度順・期限順・ドラッグ&ドロップ）

対象外: ユーザー登録・ログイン、複数ボード、担当者・ラベル、インターネット公開・複数人利用（[今後の拡張候補](./docs/future.md)）。

## 実装状況
要件定義の機能は段階的に実装している。現時点の状況は以下のとおり。

| 領域 | 実装済み | 未実装（要件定義済み） |
|------|---------|------------------------|
| バックエンド | カードのCRUD API（`GET/POST/PUT/DELETE /api/cards`）、検索・絞り込み（`keyword` / `status` / `priority`）、入力バリデーション、エラーレスポンス共通化、CORS設定 | 並び順の永続化 |
| フロントエンド | 3列ボードの表示、タスク名での検索 | カードの追加・編集・削除、ドラッグ&ドロップ移動、並び替え |

## システム構成
```
フロントエンド (React + Vite, :5173)
        │ HTTP (fetch, JSON)
        ▼
バックエンド (Spring Boot, :8080)  ── REST API ──  /api/cards
        │ SQL (Spring Data JPA / Hibernate)
        ▼
データベース (PostgreSQL 16, :5432 / Docker)
```
詳細は [技術スタック・システム構成書](./docs/tech-stack.md) を参照。

## 技術スタック
| 領域 | 技術 |
|------|------|
| フロントエンド | React 19.3.1 / TypeScript 7.0.2（strict）/ Vite 8.3.8 / oxlint 1.94.0 / Node.js 24.18.0 |
| バックエンド | Java 21 (LTS) / Spring Boot 4.1.0 / Gradle 9.5.1 / Spring Data JPA / Bean Validation |
| データベース | PostgreSQL 16（Docker） |

各技術の選定理由は [技術スタック・システム構成書](./docs/tech-stack.md) を参照。

## ディレクトリ構成
```
Taskmanagement/
├── backend/             # Spring Boot（Gradle）
│   └── src/main/java/com/taskmanagement/backend/
│       ├── card/        # カードのController / Service / Repository / Entity / DTO
│       ├── common/      # 共通エラーレスポンス・例外ハンドラ
│       └── config/      # CORS設定
├── frontend/            # React + Vite（TypeScript）
│   └── src/
│       ├── api/         # バックエンドAPI呼び出し
│       ├── components/  # Board / Column / Card / SearchBar
│       └── types.ts     # カード・列・優先度の型
├── db/seed.sql          # 動作確認用のテストデータ
├── docs/                # 要件定義・設計ドキュメント
├── mock/                # 画面モック（静的HTML）
├── docker-compose.yml   # PostgreSQL
├── .env.example         # DB接続情報のサンプル
└── CLAUDE.md            # リポジトリ運用ルール
```

## セットアップと起動

### 事前準備
- Java 21（LTS）
- Node.js（動作確認: 24.18.0）
- Docker Desktop（または Docker Engine + Docker Compose）

### 起動手順
起動順は DB → バックエンド → フロントエンド。ポートは固定（後述）。

```
# 1. PostgreSQL（リポジトリルートで実行）
docker compose up -d

# 2. バックエンド（別ターミナル）
cd backend
./gradlew.bat bootRun        # Mac/Linux は ./gradlew bootRun

# 3. フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev
```
ブラウザで `http://localhost:5173` を開く。

| 対象 | ポート |
|------|--------|
| フロントエンド（Vite） | 5173 |
| バックエンド（Spring Boot） | 8080 |
| PostgreSQL | 5432 |

> ポートは固定（別ポートでの起動は不可）。フロントのURL（5173）はバックエンドのCORS許可オリジンに、バックエンドのURL（8080）はフロントの `VITE_API_BASE_URL` に埋め込まれているため、ずらすと画面が動かなくなる。

## バックエンド（backend/）
Java + Spring Boot + Gradle + Spring Data JPA + PostgreSQL。

### 環境変数
未設定時はローカル開発用のデフォルト値を使用する。

| 環境変数 | デフォルト値 |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/taskmanagement` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |

### PostgreSQL（Docker）
ルートの `docker-compose.yml` で起動する。`taskmanagement` データベースは初回起動時に自動作成される。接続情報を変えたい場合は `.env.example` を `.env` にコピーして編集する（`.env` はGit管理外）。

```
docker compose up -d      # 起動
docker compose down       # 停止
docker compose down -v    # 停止 + データボリュームも削除
```
テーブルは起動時に `spring.jpa.hibernate.ddl-auto=update` で自動作成される（本番運用ではFlyway等への切り替えを推奨）。動作確認用のテストデータは `db/seed.sql` にある。

### API
| メソッド | パス | 内容 |
|----------|------|------|
| GET | `/api/cards` | カード取得。任意のクエリ `keyword`（タイトル部分一致・大文字小文字無視）、`status`（TODO/DOING/DONE）、`priority`（HIGH/MEDIUM/LOW） |
| GET | `/api/cards/{id}` | カードを1件取得（存在しなければ404） |
| POST | `/api/cards` | カード作成 |
| PUT | `/api/cards/{id}` | カード更新（列の移動も `status` の更新で行う） |
| DELETE | `/api/cards/{id}` | カード削除 |

例: `curl "http://localhost:8080/api/cards?keyword=資料&status=TODO"`
詳細は [API仕様書](./docs/api.md) を参照。

### テスト
```
cd backend
./gradlew.bat test
```

## フロントエンド（frontend/）
React + Vite（TypeScript）。カードを To Do / Doing / Done の3列ボードで表示し、タスク名で検索できる。

### コマンド
| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー起動（`http://localhost:5173`） |
| `npm run build` | 型チェック（`tsc -b`）+ 本番ビルド |
| `npm run lint` | 静的解析（oxlint） |
| `npm run preview` | ビルド結果のプレビュー |

### 環境変数
APIのURLを変える場合は `frontend/.env.example` を `.env` にコピーして `VITE_API_BASE_URL`（デフォルト `http://localhost:8080`）を編集する。

## 開発ルール
運用ルールは [CLAUDE.md](./CLAUDE.md) に定義している。要点:

- 作業前に GitHub Issue を作成する
- ブランチは `master` から `種別/issue番号-概要` で作成（例: `docs/11-tech-versions-readme`）
- `master` への直接コミット・pushは禁止。PRを作成し、本文に `Closes #<issue番号>` を記載する
- PRのマージはユーザー確認の上で行う
- 開発サーバーは既定ポート（8080 / 5173）で起動し、競合時は占有プロセスを停止する

## ドキュメント
| ドキュメント | 内容 |
|--------------|------|
| [要件定義書](./docs/requirements.md) | 背景・目的、ユースケース、スコープ、制約（全体の入口） |
| [機能一覧・受け入れ基準](./docs/features.md) | MVPの11機能と受け入れ基準 |
| [画面設計書](./docs/screens.md) | 画面イメージ、状態遷移、操作仕様 |
| [ER図・DB設計書](./docs/database.md) | `cards` テーブル定義 |
| [API仕様書](./docs/api.md) | REST APIエンドポイント |
| [技術スタック・システム構成書](./docs/tech-stack.md) | 構成図、採用技術・バージョン・選定理由 |
| [非機能要件書](./docs/non-functional.md) | 動作環境、セキュリティなど |
| [今後の拡張候補](./docs/future.md) | MVP後の拡張アイデア |
