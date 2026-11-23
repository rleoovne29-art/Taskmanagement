---
name: start-dev-servers
description: バックエンド(Spring Boot, 8080)とフロントエンド(Vite, 5173)の開発サーバーを起動・再起動し、動作確認する。ポート競合時は占有プロセスを停止して必ず既定ポートで起動する。「サーバーを起動して」「動作確認して」「localhost:5173を開いて」「画面を確認して」「bootRunして」「npm run devして」など、アプリを実際に動かす依頼では、明示的にスキル名を言われなくても必ずこのスキルを使うこと。ポートが使用中・競合・別ポートで起動した、という話題でも使う。
---

# 開発サーバーの起動（既定ポート固定）

なぜ既定ポートに固定するのか: フロントのURL（5173）はバックエンドのCORS許可オリジンに、バックエンドのURL（8080）はフロントのAPI接続先に埋め込まれている。ポートをずらすと画面は開いてもAPI通信が失敗し、原因が分かりにくい。だから「逃げずに、邪魔なプロセスを止めて既定ポートで起動する」を徹底する。

| 対象 | ポート | 起動コマンド |
|------|--------|--------------|
| PostgreSQL | 5432 | `docker compose up -d`（`Taskmanagement/` 直下） |
| バックエンド | **8080** | `cd backend && ./gradlew.bat bootRun` |
| フロントエンド | **5173** | `cd frontend && npm run dev` |

## 絶対ルール
- **ポートを変えて起動しない**（`--server.port` / `--port` / `SERVER_PORT` / `PORT` / `strictPort` 無効化は禁止）。別ポートではCORSとAPI URLが食い違い動作しない。
- 競合したら **占有プロセスを停止して、既定ポートで起動する**。
- 停止してよいのは `8080` と `5173` の占有プロセスだけ。`5432` など他ポートは停止せずユーザーに報告する。
- 停止前に、プロセス名とPIDをユーザーへ報告する。

## 手順（Windows / PowerShell）

1. DBが起動していることを確認する: `docker ps`（なければ `docker compose up -d`）
2. 起動する前に、対象ポートの占有を調べる（`8080` と `5173` それぞれ）:
   ```powershell
   Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue |
     ForEach-Object { $p = Get-Process -Id $_.OwningProcess; "$($p.ProcessName) PID=$($p.Id)" }
   ```
3. 占有があれば、プロセス名とPIDを報告したうえで停止する:
   ```powershell
   Stop-Process -Id <PID> -Force
   ```
   - 占有元が Docker コンテナ（`com.docker*` / `docker-proxy` 等）の場合は、Docker本体を止めず `docker ps` でコンテナを特定し `docker stop <コンテナ名>` する。
   - Gradle/Java のバックエンドが残っている場合、親の Gradle デーモンではなく、ポートを握っている Java プロセスを停止する。
4. 再度手順2を実行し、**ポートが空いたことを確認**する（出力が空であること）。空かなければ手順3をやり直す。
5. バックエンドを起動する（バックグラウンド実行）。起動ログに `Tomcat started on port 8080` が出ることを確認する。
6. フロントエンドを起動する（バックグラウンド実行）。`Local: http://localhost:5173/` と表示されることを確認する。`strictPort: true` のため、5173 が使えない場合は別ポートに逃げずエラー終了する。その場合は手順2〜4に戻る。
7. 疎通確認: `curl http://localhost:8080/api/cards`、ブラウザで `http://localhost:5173` を開く。

## 完了報告に含めること
- 競合があったか、停止したプロセス（名前・PID）
- 実際に使われたポート（8080 / 5173 であること）
