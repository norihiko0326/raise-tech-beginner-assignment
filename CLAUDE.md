# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🏗️ プロジェクト構成

家計簿アプリケーション（Household Budget App）は、3層アーキテクチャで構成されています：

| レイヤー | 技術 | 状態 |
|---------|------|------|
| **フロントエンド** | Next.js 14 + React + TypeScript | 📋 未実装 |
| **バックエンド** | Python Flask 2.3 + SQLite | ✅ 実装済み |
| **データベース** | SQLite（開発）→ MySQL 8.0（本番） | ✅ 実装済み |

### バックエンド構成

- `backend/app.py` — Flask REST API サーバー
- `backend/init_db.py` — データベース初期化スクリプト
- `backend/household.db` — SQLite 開発用データベース
- `backend/requirements.txt` — Python 依存ライブラリ
- API エンドポイント：`http://localhost:5000`
- CORS 対応済み（フロントエンドからアクセス可能）

### API エンドポイント（実装済み）

| エンドポイント | メソッド | 説明 |
|-------------|---------|------|
| `/health` | GET | ヘルスチェック |
| `/api/transactions` | GET/POST | 収支の取得・作成 |
| `/api/transactions/{id}` | PUT/DELETE | 収支の編集・削除 |
| `/api/summary/{year_month}` | GET | 月別集計（収入・支出・残高） |
| `/api/chart-data` | GET | グラフデータ（過去6ヶ月） |
| `/api/categories` | GET/POST | カテゴリの取得・作成 |
| `/api/categories/{id}` | DELETE | カテゴリの削除 |

詳細は `backend/API_ENDPOINTS.md` を参照。

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

## 🚀 開発環境のセットアップ

### バックエンド（既に実装済み）

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py  # http://localhost:5000 で起動
```

### フロントエンド（これから実装）

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000 で起動
```

### ローカルで両者を連携させる場合

1. **バックエンド** を別ターミナルで起動：`cd backend && python app.py`
2. **フロントエンド** を別ターミナルで起動：`cd frontend && npm run dev`
3. フロントエンド（localhost:3000）からバックエンド（localhost:5000）の API を呼び出す

フロントエンド側では、API ベース URL を環境変数で設定：
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

---

## 💻 よく使うコマンド

### バックエンド
- **サーバー起動**：`python app.py`
- **API テスト**：`curl http://localhost:5000/health`
- **依存ライブラリ更新**：`pip install -r requirements.txt`

### フロントエンド（未実装）
- **開発サーバー起動**：`npm run dev`
- **ビルド**：`npm run build`
- **テスト**：`npm test`
- **型チェック**：`npx tsc --noEmit`

---

## 🔄 フロントエンド実装フェーズ

今後のフロントエンド開発では、以下を実装予定：

1. **ホーム画面** — 月別サマリー表示
2. **収支記録フォーム** — 新規作成・編集・削除機能
3. **カテゴリ管理** — カテゴリの一覧・追加・削除
4. **グラフ表示** — recharts で過去6ヶ月の月別収支を可視化
5. **月別切り替え** — 過去6ヶ月のデータ閲覧

詳細は `docs/` 配下の各仕様書を参照。

---

**最終更新：** 2026年6月22日
**バージョン：** 2.0（技術スタック情報追加）
