# Taskmanagement
Task Management Project

## バックエンド（backend/）

Java + Spring Boot + Gradle + Spring Data JPA + PostgreSQL のひな型。

### 事前準備
- Java 21（LTS）
- PostgreSQL（`taskmanagement` という名前のデータベースを作成しておく）

接続情報は環境変数で上書きできる（未設定時はローカル開発用のデフォルト値を使用）:

| 環境変数 | デフォルト値 |
|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/taskmanagement` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | `postgres` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` |

### 起動方法
```
cd backend
./gradlew.bat bootRun
```
起動すると `http://localhost:8080` でAPIが立ち上がる（`GET/POST /api/cards`、`PUT/DELETE /api/cards/{id}`）。
テーブルは起動時に`spring.jpa.hibernate.ddl-auto=update`により自動作成される（本番運用ではFlyway等への切り替えを推奨）。

