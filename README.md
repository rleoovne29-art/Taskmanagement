# Taskmanagement
Task Management Project

## バックエンド（backend/）

Java + Spring Boot + Gradle + Spring Data JPA + PostgreSQL のひな型。

### 事前準備
- Java 21（LTS）
- Docker Desktop（または Docker Engine + Docker Compose）— PostgreSQLをコンテナで起動するために使用

接続情報は環境変数で上書きできる（未設定時はローカル開発用のデフォルト値を使用）:

| 環境変数 | デフォルト値 |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/taskmanagement` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |

### PostgreSQLの起動（Docker）
リポジトリルートの `docker-compose.yml` でPostgreSQLコンテナを起動する（`taskmanagement` データベースはコンテナ初回起動時に自動作成される）。接続情報を変更したい場合は `.env.example` を `.env` にコピーして編集する。

```
docker compose up -d
```

停止・データ削除:
```
docker compose down      # コンテナを停止
docker compose down -v   # コンテナ停止 + データボリュームも削除
```

### 起動方法
```
cd backend
./gradlew.bat bootRun
```
起動すると `http://localhost:8080` でAPIが立ち上がる（`GET/POST /api/cards`、`PUT/DELETE /api/cards/{id}`）。
テーブルは起動時に`spring.jpa.hibernate.ddl-auto=update`により自動作成される（本番運用ではFlyway等への切り替えを推奨）。




## フロントエンド（frontend/）
React + Vite（JavaScript）。カードを To Do / Doing / Done の3列ボードで表示し、タスク名で検索できる。

### 起動方法
バックエンド（`http://localhost:8080`）を起動した状態で、以下を実行する。
```
cd frontend
npm install
npm run dev
```
`http://localhost:5173` で画面が開く（バックエンドのCORS許可オリジンと同じポート）。
APIのURLを変える場合は `frontend/.env.example` を `.env` にコピーして `VITE_API_BASE_URL` を編集する。

その他: `npm run build`（本番ビルド）、`npm run lint`（静的解析）。
