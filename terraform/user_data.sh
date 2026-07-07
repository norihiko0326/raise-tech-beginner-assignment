#!/bin/bash

# ログ出力
exec > >(tee /var/log/user_data.log)
exec 2>&1

echo "EC2 initialization started at $(date)"

# システム更新
echo "Updating system..."
yum update -y

# Python インストール（Amazon Linux 2023 では python3.11 がデフォルト）
echo "Installing Python..."
yum install -y python3 python3-venv python3-pip python3.11-devel

# git インストール
echo "Installing Git..."
yum install -y git

# Git LFS インストール
echo "Installing Git LFS..."
yum install -y git-lfs

# アプリケーションディレクトリ作成
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# GitHub からリポジトリをクローン（タイムアウト対策）
echo "Cloning repository from GitHub..."
git config --global http.connectTimeout 60
git config --global http.postBuffer 1048576000
git clone --depth 1 --branch ${github_branch} ${github_repo_url} . 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Git clone failed. Retrying..."
  rm -rf *
  git clone --depth 1 --branch ${github_branch} ${github_repo_url} .
fi

# Git LFS セットアップ
echo "Setting up Git LFS..."
git lfs install
git lfs pull

# Node.js インストール（NodeSource経由、v18LTS）
echo "Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# バックエンド セットアップ
echo "Setting up backend..."
cd /home/ec2-user/app/backend || exit 1
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# バックエンド用 .env ファイル作成
echo "Creating backend .env file..."
cat > /home/ec2-user/app/backend/.env << EOF
DB_HOST=${db_host}
DB_USER=${db_username}
DB_PASSWORD=${db_password}
DB_NAME=${db_name}
EOF
chmod 600 /home/ec2-user/app/backend/.env
chown ec2-user:ec2-user /home/ec2-user/app/backend/.env

# テーブル初期化（MySQL版init_db.pyを実行）
echo "Initializing MySQL database..."
/home/ec2-user/app/backend/venv/bin/python /home/ec2-user/app/backend/init_db.py || true

# フロントエンド セットアップ
echo "Setting up frontend..."
cd /home/ec2-user/app/frontend || exit 1
export NEXT_PUBLIC_API_URL="http://${eip}:5000"
npm install
npm run build

# systemd ユニットファイル作成: バックエンド
echo "Creating systemd service for backend..."
cat > /etc/systemd/system/household-backend.service << 'EOF'
[Unit]
Description=Household App Backend (Flask/Gunicorn)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app/backend
EnvironmentFile=/home/ec2-user/app/backend/.env
ExecStart=/home/ec2-user/app/backend/venv/bin/gunicorn -w 2 -b 0.0.0.0:5000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# systemd ユニットファイル作成: フロントエンド
echo "Creating systemd service for frontend..."
cat > /etc/systemd/system/household-frontend.service << 'EOF'
[Unit]
Description=Household App Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app/frontend
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# systemd サービス有効化・起動
echo "Enabling and starting systemd services..."
systemctl daemon-reload
systemctl enable --now household-backend household-frontend

# パーミッション修正
chown -R ec2-user:ec2-user /home/ec2-user/app

echo "EC2 initialization completed at $(date)"
echo "Backend: http://0.0.0.0:5000"
echo "Frontend: http://0.0.0.0:3000"
echo "Check status: sudo systemctl status household-backend household-frontend"
