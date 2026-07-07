# 家計簿アプリ

シンプルで使いやすい家計簿管理アプリケーション。日々の収支をカテゴリ分けして記録・編集・削除でき、月別に集計・グラフで確認できます。

## 🎯 主な機能

- ✅ 収支の記録・編集・削除 ← **新機能**
- ✅ カテゴリ管理（初期カテゴリ10種）
- ✅ 月別集計（収入・支出・残高）
- ✅ グラフ表示（過去6ヶ月）
- ✅ 過去データ閲覧

## 📹 デモ

![デモ動画](./demo.gif)

**操作内容：**
- 記録新規作成（金額・カテゴリ入力 → 保存）
- 記録一覧に反映
- 記録編集・削除

## 🏗️ アーキテクチャ

### クラウド構成（AWS）

```
ブラウザ（ユーザー）
   ↓ HTTP
   ├─ http://16.76.22.118:3000 → Next.js フロント
   └─ http://16.76.22.118:5000 → Flask バックエンド API
         ↓ SQL
      RDS MySQL 8.0（データベース）
```

**EC2 内での構成（Amazon Linux 2023）:**
```
systemd で管理
├─ household-backend.service → gunicorn (Flask :5000)
└─ household-frontend.service → npm run start (Next.js :3000)
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| **フロントエンド** | Next.js 14 + React + TypeScript + recharts |
| **バックエンド** | Python 3.11 + Flask 2.3.0 + mysql-connector-python |
| **データベース** | MySQL 8.4.8（RDS） |
| **インフラ** | AWS EC2 (Amazon Linux 2023) + RDS |
| **サービス管理** | systemd |
| **IaC** | Terraform |

## 🚀 デプロイ手順

### 前提条件
- AWS アカウント
- Terraform インストール
- AWS CLI 認証済み

### Step 1: Terraform で AWS リソース構築

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**出力例：**
```
ec2_public_ip = "16.76.22.118"
rds_address = "terraform-xxx.rds.amazonaws.com"
```

### Step 2: EC2 初回起動待機（5-10分）

user_data.sh が自動実行され、以下が行われます：
- Python 3.11 + Flask 2.3.0 インストール
- Node.js 18 インストール
- リポジトリ clone + git LFS pull
- 仮想環境構築（venv）
- npm install + npm run build
- systemd サービス登録・自動起動設定

**EC2 起動後の手作業（オプション）:**
```bash
ssh -i your-key.pem ec2-user@16.76.22.118

# DB 初期化（必要な場合）
cd /home/ec2-user/app/backend
source venv/bin/activate
python init_db.py
```

### Step 3: ブラウザでアクセス

```
フロントエンド: http://16.76.22.118:3000
バックエンド API: http://16.76.22.118:5000
ヘルスチェック: http://16.76.22.118:5000/health
```

### Step 4: サービス管理（EC2 内）

```bash
# サービス状態確認
sudo systemctl status household-backend
sudo systemctl status household-frontend

# ログ確認
sudo journalctl -u household-backend -f
sudo journalctl -u household-frontend -f

# 再起動
sudo systemctl restart household-backend
sudo systemctl restart household-frontend
```

## 📝 ローカル開発環境

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git LFS
- MySQL（ローカル）または RDS への接続

### バックエンド起動

```bash
# リポジトリクローン
git clone https://github.com/norihiko0326/raise-tech-beginner-assignment.git
cd raise-tech-beginner-assignment/backend

# Python 仮想環境作成
python -m venv venv
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# 依存ライブラリインストール
pip install -r requirements.txt

# 環境変数設定
export DB_HOST=localhost
export DB_USER=admin
export DB_PASSWORD=testpassword123
export DB_NAME=householdapp

# DB 初期化
python init_db.py

# Flask 起動（開発モード）
python app.py
# http://localhost:5000 で起動
```

### フロントエンド起動

```bash
cd ../frontend

# Node.js 依存ライブラリインストール
npm install

# 環境変数設定
export NEXT_PUBLIC_API_URL=http://localhost:5000

# 開発サーバー起動
npm run dev
# http://localhost:3000 で起動
```

### API テスト

```bash
# ヘルスチェック
curl http://localhost:5000/health

# カテゴリ取得
curl http://localhost:5000/api/categories

# 月別集計
curl http://localhost:5000/api/summary/2026-07
```

## 🔄 CI/CD（今後の改善案）

- GitHub Actions で自動テスト
- Terraform Plan/Apply の自動化
- Docker イメージレジストリ（ECR）
- デプロイ自動化

## 📚 詳細ドキュメント

- [画面仕様書](docs/01_SCREEN_SPECIFICATIONS.md)
- [API 仕様](docs/04_API_SPECIFICATION.md)
- [データベース設計](docs/03_DATABASE_DESIGN.md)
- [技術スタック](docs/05_TECHNOLOGY_STACK.md)
- [デプロイ計画](DEPLOYMENT_PLAN.md)

## 💡 実装時の工夫

1. **インフラ as Code（IaC）**
   - Terraform で AWS リソース（EC2 + RDS）をコード化
   - 再現性・版管理が容易
   - 環境構築が 1 コマンド

2. **systemd サービス管理**
   - Flask・Next.js を systemd サービスで自動起動
   - EC2 再起動時に自動復旧
   - Docker より シンプルでトラブル対応が容易

3. **Amazon Linux 2023 採用**
   - glibc 2.34 で Flask 2.3.0 と Node.js 18 を完全サポート
   - Python 3.11 で最新ライブラリ対応
   - Amazon Linux 2 のサポート終了（2025年6月）に先制対応

4. **記録削除機能**
   - UI から直接削除可能（削除前に確認ダイアログ）
   - RDS のデータも正確に削除

5. **自動デプロイ**
   - user_data.sh で EC2 初回起動時に全自動実行
   - 手作業は init_db.py 実行のみ（オプション）

## 🛠️ トラブルシューティング

### サービスが起動していない

```bash
# SSH でログイン
ssh -i your-key.pem ec2-user@16.76.22.118

# サービス状態確認
sudo systemctl status household-backend
sudo systemctl status household-frontend

# ログ確認
sudo journalctl -u household-backend -f
sudo journalctl -u household-frontend -f

# 再起動
sudo systemctl restart household-backend
sudo systemctl restart household-frontend
```

### API が応答しない

```bash
# バックエンド確認
curl http://localhost:5000/health

# ポート確認
sudo ss -tlnp | grep -E ':(3000|5000)'

# gunicorn プロセス確認
ps aux | grep gunicorn
```

### フロント・バック API 連携エラー

```bash
# DevTools（F12）→ Network タブで API 呼び出しを確認
# API URL が正しいか確認（http://16.76.22.118:5000）

# または EC2 内で直接テスト
curl http://localhost:5000/api/categories
```

### RDS 接続エラー

```bash
# 環境変数確認
cat /home/ec2-user/app/backend/.env

# RDS との接続テスト
source venv/bin/activate
python -c "
import mysql.connector
conn = mysql.connector.connect(
    host='terraform-xxx.rds.amazonaws.com',
    user='admin',
    password='testpassword123',
    database='householdapp'
)
print('✅ RDS 接続成功')
"
```

## 📦 リソースクリーンアップ

```bash
# AWS リソース削除
cd terraform
terraform destroy
```

## 👤 作成者

norihiko0326

## 📄 ライセンス

MIT

---

**最終更新：** 2026年7月7日（Issue #9: Amazon Linux 2023 + 削除機能）
