# リポジトリ運用ルール（ClaudeCode厳守事項）

このリポジトリでは以下のGitHub運用ルールを **必ず** 守ること。例外はユーザーから明示的な指示があった場合のみ。

## 1. 作業着手前に必ず GitHub Issue を作成する

コードの変更・調査以外の実装作業を始める前に、対応する Issue が存在しない場合は `gh issue create` で作成する。

Issueには最低限以下を含める:
- 背景（なぜその作業が必要か）
- 作業内容
- 完了条件

```
gh issue create --title "<タイトル>" --body "## 背景
...

## 作業内容
...

## 完了条件
..."
```

## 2. 作業ブランチは master から切る

命名規則: `種別/issue番号-概要`

- `feature/12-add-login` … 機能追加
- `fix/15-null-check` … バグ修正
- `chore/20-update-deps` … 雑務・設定変更
- `docs/22-update-readme` … ドキュメント
- `refactor/25-cleanup-api` … リファクタリング

```
git checkout master
git pull origin master
git checkout -b feature/12-add-login
```

## 3. master への直接コミット・直接pushは禁止

すべての変更は作業ブランチ上で行い、`gh pr create` でPRを作成してマージする。masterへの直接push（`git push origin master`）は行わない。

## 4. PRとIssueを紐付ける

PR本文に `Closes #<issue番号>` を含め、マージ時にIssueが自動的にクローズされるようにする。

```
gh pr create --title "<タイトル>" --body "Closes #12

## 変更内容
..."
```

## 5. マージはユーザー確認の上で行う

PR作成後、マージするかどうかはユーザーに確認を取ってから実行する（無断でマージしない）。

## 6. 開発サーバーは必ず既定ポートで起動する（ポート競合時は占有プロセスを停止）

動作確認でサーバーを起動するときは、以下の **既定ポート** で必ず起動する。

| 対象 | 既定ポート | 設定箇所 |
|------|-----------|----------|
| バックエンド（Spring Boot） | `8080` | `backend/src/main/resources/application.properties` の `server.port` |
| フロントエンド（Vite） | `5173` | `frontend/vite.config.js`（`strictPort: true`） |

理由: フロントのURL（5173）はバックエンドのCORS許可オリジンに、バックエンドのURL（8080）はフロントの `VITE_API_BASE_URL` に固定されており、別ポートで起動すると画面が動かない。

- **別ポートでの一時起動は禁止**。`--server.port`、`--port`、環境変数での `SERVER_PORT` / `PORT` 変更、`vite.config.js` の `strictPort` を外すなどでポートをずらさない。
- ポートが使用中（競合）の場合は、**占有しているプロセスを特定して停止し、ポートが空いたことを確認してから**既定ポートで起動する。
- 停止前に、停止対象のプロセス名とPIDを必ずユーザーへ報告する。
- 停止の対象は `8080` と `5173` の占有プロセスのみ。それ以外のポート（例: PostgreSQL の `5432`）は停止せず、競合した場合はユーザーに報告して指示を仰ぐ。
- 占有しているのがDockerコンテナの場合は、Docker本体を落とさず該当コンテナのみ `docker stop` する。
- 具体的な手順は `.claude/skills/start-dev-servers/SKILL.md` に従う。
