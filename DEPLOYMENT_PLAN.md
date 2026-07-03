# AWS EC2/RDS へのデプロイ実装計画（A案・最終版）

## Context

学習プロジェクト「家計簿アプリ」を AWS に完全統一でデプロイ。

**構成：** EC2 上で Nginx + Docker Compose（バックエンド + フロントエンド）+ RDS MySQL

**ゴール：**
- AWS EC2 上で http://52.197.32.171 にアクセスで動作確認
- README に デモ動画・アーキテクチャを記載
- GitHub PR を作成して `main` にマージ
- ポートフォリオに掲載可能な状態にする

---

## 📊 現状確認

| 項目 | 状態 | ファイル |
|------|------|---------|
| **バックエンド（Flask）** | ✅ ローカル動作確認済み | `backend/app.py`, `requirements.txt` |
| **フロントエンド（Next.js）** | ✅ ローカル動作確認済み | `frontend/app/`, `package.json` |
| **バック Dockerfile** | ✅ 存在 | `backend/Dockerfile` |
| **フロント Dockerfile** | ✅ 存在 | `frontend/Dockerfile` |
| **docker-compose.yml** | ✅ 存在（修正版） | `docker-compose.yml`（ローカル MySQL削除済み） |
| **Nginx 設定ファイル** | ✅ **作成完了** | `nginx.conf` |
| **terraform 設定** | ✅ 存在 | `terraform/` 一式 |
| **user_data.sh** | ⚠️ 部分完成 | Docker化済み、Nginx未統合 |
| **README** | ⏳ 作成予定 | `README.md` |

---

## 🎯 実施計画（5フェーズ）

### Phase 1: ローカルで Nginx 統合テスト

**目標：** ローカルで `http://localhost` にアクセスして全機能動作確認

#### Step 1-1: nginx.conf 作成 ✅ 完了

**場所：** `nginx.conf`（リポジトリルート）

Nginx リバースプロキシ設定ファイル。以下を定義：
- upstream frontend/backend サーバー指定
- location / → フロント（ポート3000）
- location /api/* → バック（ポート5000）CORS対応
- location /health → ヘルスチェック

#### Step 1-2: docker-compose.yml に Nginx 追加 ⏳ 進行中

**修正場所：** `docker-compose.yml`（既存ファイルを拡張）

修正内容：
- backend/frontend サービスからポート指定を削除（Nginx経由のみ）
- nginx サービス追加（nginx:alpine、ポート 80）
- networks: app-network でコンテナ間通信設定
- NEXT_PUBLIC_API_URL を localhost に変更

#### Step 1-3: .env ファイル作成

**場所：** `.env`（リポジトリルート、.gitignore済み）

```
DB_HOST=localhost
DB_PASSWORD=testpassword123
```

#### Step 1-4: ローカルで起動テスト

```bash
# 全サービス停止
docker-compose down

# fresh start
docker-compose up -d

# ブラウザでアクセス
http://localhost

# 動作確認
- フロント表示 ✓
- 記録追加・編集・削除 ✓
- グラフ表示 ✓
- ヘルスチェック（/health）✓

# ログ確認
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

### Phase 2: terraform/user_data.sh を Nginx 対応に修正

**目標：** EC2 起動時に自動で全サービス起動

#### Step 2-1: user_data.sh を簡潔に修正

**修正内容：**
- git LFS 対応を追加（`git lfs install` + `git lfs pull`）
- Docker Compose ベースに変更（PM2 削除）
- `docker compose up -d --build` で完結

**新 user_data.sh 内容：**

```bash
#!/bin/bash
set -e

echo "=========================================="
echo "EC2 Initialization Started"
echo "=========================================="

# システム更新
yum update -y

# Docker インストール
amazon-linux-extras install docker -y
service docker start
systemctl enable docker
usermod -aG docker ec2-user

# docker-compose プラグイン v2 インストール
mkdir -p /root/.docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /root/.docker/cli-plugins/docker-compose
chmod +x /root/.docker/cli-plugins/docker-compose

# Git LFS インストール
yum install -y git-lfs

# リポジトリクローン
cd /home/ec2-user
rm -rf app
git clone --depth 1 --branch ${github_branch} ${github_repo_url} app
cd app

# Git LFS セットアップ
git lfs install
git lfs pull

# .env ファイル作成
cat > .env << EOF
DB_HOST=${db_host}
DB_PASSWORD=${db_password}
FLASK_ENV=production
NEXT_PUBLIC_API_URL=http://$(ec2-metadata --public-ipv4 | cut -d " " -f 2)
EOF

# パーミッション修正
chown -R ec2-user:ec2-user /home/ec2-user/app

# Docker Compose で全サービス起動
docker compose up -d --build

echo "=========================================="
echo "EC2 Initialization Complete"
echo "=========================================="
echo "Access: http://$(ec2-metadata --public-ipv4 | cut -d ' ' -f 2)"
echo "Health: http://$(ec2-metadata --public-ipv4 | cut -d ' ' -f 2)/health"
```

---

### Phase 3: README を更新（デプロイ手順 + デモ追加）

**目標：** ポートフォリオ用に完成度の高い README を作成

**ファイル：** `README.md`（全面更新）

**新 README に含める内容：**

1. **プロジェクト概要**
   - 機能一覧（記録・編集・削除、カテゴリ管理、月別集計、グラフ）

2. **デモ動画**
   - `![デモ動画](./demo.gif)`

3. **アーキテクチャ図**
   ```
   ブラウザ
      ↓ HTTP (http://52.197.32.171)
   Nginx（リバースプロキシ） - EC2
      ├─ / → Next.js フロント（ポート 3000）
      ├─ /api/* → Flask バック（ポート 5000）
      └─ Docker Compose で管理
      ↓ SQL
   RDS MySQL（データベース）
   ```

4. **技術スタック表**
   - フロント：Next.js 14 + React + TypeScript + recharts
   - バック：Python 3.11 + Flask + SQLAlchemy
   - DB：MySQL 8.0（RDS）
   - インフラ：AWS EC2 + RDS + Docker + Nginx
   - IaC：Terraform

5. **デプロイ手順**
   - 前提条件（AWS アカウント、Terraform、AWS CLI）
   - Step 1: terraform apply
   - Step 2: 待機（5-10分）
   - Step 3: ブラウザアクセス

6. **ローカル開発環境**
   - 前提条件：Docker Desktop、Git LFS
   - git clone → git lfs pull → .env 作成 → docker-compose up

7. **トラブルシューティング**
   - EC2 でコンテナが起動しない場合
   - API 連携エラーの場合

8. **リソースクリーンアップ**
   - terraform destroy

---

### Phase 4: デモ動画の録画

**目標：** ローカルで動作確認し、画面を録画

#### Step 4-1: ローカルで docker-compose 起動

```bash
docker-compose up -d
# 起動完了待機（30秒程度）
```

#### Step 4-2: ブラウザで http://localhost にアクセス

#### Step 4-3: Windows で画面録画（Windows + G キー）

**操作シナリオ（約1分）：**
1. ホーム画面表示
2. 「新規記録」ボタンをクリック
3. 日付・金額・カテゴリ入力 → 追加
4. グラフをスクロール
5. カテゴリ管理で新規カテゴリ追加
6. 記録削除

#### Step 4-4: MP4 → GIF 変換（ffmpeg）

```bash
ffmpeg -i demo.mp4 -vf "fps=10,scale=800:-1" demo.gif
```

**リポジトリルートに `demo.gif` を配置**

---

### Phase 5: GitHub PR 作成・マージ

**目標：** 全変更を main ブランチにマージ

#### Step 5-1: ローカルで最終テスト

```bash
docker-compose up -d
# http://localhost でアクセス
# 全機能動作確認
docker-compose down
```

#### Step 5-2: Git コミット

```bash
git add -A
git commit -m "feat: AWS EC2 + Nginx でのフルスタックデプロイ完成"
```

**コミットメッセージに含める内容：**
- nginx.conf 作成（リバースプロキシ・CORS対応）
- docker-compose.yml に Nginx サービス追加
- terraform/user_data.sh を Docker Compose ベースに修正
- README 全体を再構成（デプロイ手順・アーキテクチャ・デモ追加）
- ローカル docker-compose で完全動作確認

#### Step 5-3: GitHub PR 作成

**タイトル：**
```
feat: AWS EC2 + Nginx でのフルスタックデプロイ完成
```

**説明：**
- 学習プロジェクト「家計簿アプリ」を AWS に完全統一でデプロイ
- EC2 上で Nginx + Docker Compose（バック + フロント）で稼働、RDS MySQL と連携
- ローカル docker-compose で全機能動作確認済み
- README・デモ動画・デプロイ手順を完備

**チェック項目：**
- ローカル動作確認（docker-compose）
- Nginx プロキシ設定確認
- API 連携確認
- デモ動画完成

#### Step 5-4: セルフレビュー

PR を作成後、以下を確認：
- ファイル変更が意図通りか
- diff を確認
- GitHub Web UI でレビュー

#### Step 5-5: Merge

GitHub Web UI から Merge または ローカルで実施：

```bash
git checkout main
git pull origin main
git merge --no-ff feature/issue-#3-database-setup
git push origin main
```

---

## ✅ 完了条件チェックリスト

- [ ] nginx.conf 作成・テスト済み
- [ ] docker-compose.yml 修正済み（Nginx追加）
- [ ] .env ファイル作成（ローカル用）
- [ ] ローカル docker-compose で全機能動作確認
- [ ] user_data.sh 修正済み
- [ ] README 全体更新済み
- [ ] demo.gif 作成済み
- [ ] GitHub PR 作成・マージ完了
- [ ] AWS（EC2 + RDS）でアクセス確認

---

## 🎯 最終的な URL

```
GitHub リポジトリ：
https://github.com/norihiko0326/raise-tech-beginner-assignment

デプロイ URL（EC2）：
http://52.197.32.171

ポートフォリオ記載用：
プロジェクト概要 + デモ動画 + GitHub リンク
```

---

## 📌 注意事項

- **git push タイムアウト対策**：LFS ファイルが大きい場合は時間がかかる可能性
- **EC2 初回起動**：user_data.sh 実行に 5-10 分要する
- **ローカル テスト必須**：EC2 に上げる前に必ず docker-compose で全機能確認
- **リソース削除**：不要になったら `terraform destroy` でコスト削減
