# Claude Code プロジェクト設定

このファイルは Claude Code が厳密に守るべきルール・設定を定義しています。

---

## 📋 Git ワークフロー

### ブランチ戦略

**ブランチ命名規則：**

| 用途 | パターン | 例 |
|------|---------|-----|
| フロントエンド開発 | `feature/frontend-*` | `feature/frontend-home-screen` |
| バックエンド開発 | `feature/backend-*` | `feature/backend-database` |
| バグ修正 | `bugfix/*` | `bugfix/api-validation` |
| ドキュメント | `docs/*` | `docs/setup-guide` |

### 開発フロー（必須）

**必ず以下の手順を守ること：**

1. **Issue を作成する**
   - GitHub Issues で Issue を新規作成
   - タイトル、説明、ラベルを記入
   - Issue 番号を取得（例：#1）

2. **ブランチを作成する**
   - Issue に基づいてブランチを作成
   - ブランチ名：`feature/issue-#1-説明` など
   - 例：`feature/issue-#5-frontend-setup`

3. **ローカルで開発する**
   ```bash
   git checkout -b feature/issue-#5-frontend-setup
   # コード変更...
   git add .
   git commit -m "..."
   ```

4. **Pull Request を作成する**
   - GitHub 上で PR を新規作成
   - Issue を PR にリンク（"Closes #5" など）
   - セルフレビュー、動作確認を記入

5. **main にマージする**
   - PR が承認されたら main にマージ
   - **main への直接プッシュは禁止**

---

## 🚫 禁止事項

| 行為 | 理由 |
|------|------|
| **main ブランチへの直接プッシュ** | PR を経由せずマージを避けるため |
| **Issue なしでの開発** | 作業の記録とトレーサビリティを確保 |
| **コミットメッセージなしの変更** | 変更履歴を明確に保つため |

---

## ✅ GitHub ブランチ保護設定

以下の設定が有効になっています：

- **Require pull request reviews** — PR マージ前に承認必須
- **Dismiss stale pull request approvals** — コミット後は再レビュー必須
- **Require branches to be up to date** — マージ前に main と同期
- **Include administrators** — 管理者も同じルールに従う

---

## 📝 Issue テンプレート

Issue 作成時は以下を記入してください：

```markdown
## 説明
何を実装するのか、何を修正するのかを説明

## 作業内容
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 受け入れ条件
- 条件1
- 条件2
```

---

## 💬 コミットメッセージ規則

```
[Issue #5] フロントエンド：ホーム画面を実装

## 内容
- ホーム画面のレイアウトを実装
- 月別サマリーボックスを実装
- 操作ボタンを配置

## 関連 Issue
Closes #5
```

**形式：** `[Issue #番号] タイトル`

---

## 🔄 PR テンプレート

```markdown
## 説明
この PR が何を解決するのかを簡潔に説明

## 関連 Issue
Closes #5

## 変更内容
- 変更1
- 変更2

## 動作確認
- [ ] ローカルで動作確認済み
- [ ] エラーがないこと確認済み

## スクリーンショット（UI 変更の場合）
（スクリーンショット）
```

---

## 🎯 Claude Code の実装方針

1. **Issue がなければ作成を提案する**
   - ユーザーが作業を依頼したら、まず Issue 番号を確認
   - 存在しなければ「Issue を作成してください」と指示

2. **Issue から ブランチを作成**
   - `git checkout -b feature/issue-#X-説明`

3. **PR を作成してから main にマージ**
   - PR のタイトル、説明を丁寧に記入
   - Issue との関連付け（"Closes #X"）

4. **main へのプッシュは絶対にしない**
   - develop や feature ブランチのみにプッシュ
   - PR 経由のみで main にマージ

---

## 📌 このプロジェクトの現状

**既存コミット：**
- main ブランチに直接コミットされている状態
- これ以降は上記ルールを厳密に守る

**今後：**
- フロントエンド開発から本ルールを適用開始
- 既存コミットは遡及しない

---

**最終更新：** 2026年6月15日
**適用開始：** フロントエンド開発フェーズ以降
