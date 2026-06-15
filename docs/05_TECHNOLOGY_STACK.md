# 技術スタック

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**

---

## システム全体図

```
┌─────────────────────┐
│  Webブラウザ         │  ← PC用
│ (フロントエンド)     │
│ Next.js+TypeScript  │
└────────┬────────────┘
         │ HTTP通信(REST API)
         ↓
┌─────────────────────┐
│ バックエンド        │  ← サーバー側
│ Python(Flask/Django)│
└────────┬────────────┘
         │ SQL通信
         ↓
┌─────────────────────┐
│ データベース        │  ← データ保存
│ MySQL              │
└─────────────────────┘
```

---

## フロントエンド

### フレームワーク・言語

- **フレームワーク** — Next.js 14以上
- **言語** — TypeScript
- **UIフレームワーク** — React（Next.jsに含まれる）
- **パッケージマネージャ** — npm または yarn

### 主なライブラリ

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| **recharts** | 月別グラフ表示 | 2.0以上 |
| **axios** | API通信 | 1.0以上 |
| **date-fns** | 日付操作 | 2.0以上 |

### 役割

- ユーザーが見る画面の表示
- ボタン操作やフォーム入力の処理
- バックエンド API との通信
- クライアント側のバリデーション

### 動作環境

- **ブラウザ対応** — Chrome, Firefox, Safari 最新版（PC用）
- **解像度** — 1024px 以上推奨
- **モバイル対応** — なし

### ディレクトリ構成例

```
frontend/
├── src/
│   ├── app/              ← Next.js App Router
│   ├── components/       ← React コンポーネント
│   │   ├── Home.tsx
│   │   ├── Chart.tsx
│   │   ├── Categories.tsx
│   │   └── dialogs/
│   ├── pages/            ← ページ（App Router使用時は app/ 配下）
│   ├── hooks/            ← カスタムフック
│   ├── services/         ← API呼び出しロジック
│   ├── types/            ← TypeScript型定義
│   └── styles/           ← CSS/スタイル
├── public/               ← 静的ファイル
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## バックエンド

### フレームワーク・言語

- **言語** — Python 3.9以上
- **フレームワーク** — **Flask 2.0以上**（確定）
  - 軽量で学習曲線が緩く、本課題のスコープに最適

### 主なライブラリ（Flask の場合）

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| **Flask** | Webフレームワーク | 2.0以上 |
| **Flask-SQLAlchemy** | ORM（データベース操作） | 3.0以上 |
| **python-dateutil** | 日付操作 | 2.8以上 |
| **Flask-CORS** | CORS対応 | 4.0以上 |

### 主なライブラリ（Django の場合）

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| **Django** | Webフレームワーク | 4.0以上 |
| **djangorestframework** | REST API フレームワーク | 3.14以上 |
| **django-cors-headers** | CORS対応 | 4.0以上 |

### 役割

- フロントエンドからのリクエストを受け取る
- リクエストのバリデーション
- データベースへのデータ保存・取得
- ビジネスロジック処理
- JSON形式でレスポンスを返す

### 動作環境

- **サーバー** — ローカル開発時は localhost:5000、本番は AWS EC2
- **ポート** — 5000（開発）
- **CORS設定** — フロントエンドオリジンのみを許可

### ディレクトリ構成例（Flask）

```
backend/
├── app/
│   ├── __init__.py       ← Flask app初期化
│   ├── models/           ← DBモデル
│   │   ├── transaction.py
│   │   └── category.py
│   ├── routes/           ← APIエンドポイント
│   │   ├── transactions.py
│   │   └── categories.py
│   ├── schemas/          ← リクエスト/レスポンス定義
│   │   ├── transaction_schema.py
│   │   └── category_schema.py
│   └── utils/            ← ユーティリティ
├── config.py             ← 設定ファイル
├── requirements.txt      ← Python依存ライブラリ
├── app.py                ← アプリケーションエントリーポイント
└── wsgi.py               ← WSGI設定（本番用）
```

---

## データベース

### データベースシステム

- **システム** — MySQL 8.0以上
- **文字コード** — UTF-8MB4（絵文字対応）

### 役割

- すべてのデータを永続的に保存
- トランザクション管理

### 動作環境

- **ローカル開発** — MySQL をローカルマシンにインストール
- **本番環境** — AWS RDS for MySQL

### 設定例

```
ホスト: localhost（開発） / your-rds-endpoint.amazonaws.com（本番）
ポート: 3306
ユーザー: household_user
パスワード: （.env ファイルで管理）
データベース: household_db
```

---

## 開発環境構築

### ローカル開発セットアップ

**1. フロントエンド**
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000 で起動
```

**2. バックエンド**
```bash
cd backend
python -m venv venv           # 仮想環境作成
source venv/bin/activate      # アクティベート（Windows: venv\Scripts\activate）
pip install -r requirements.txt
python app.py                 # http://localhost:5000 で起動
```

**3. データベース**
```bash
mysql -u root
CREATE DATABASE household_db CHARACTER SET utf8mb4;
USE household_db;
# init.sql を実行
```

### Docker での構築（オプション）

docker-compose.yml で一括セットアップ可能（将来的）

---

## デプロイ環境

### 本番環境アーキテクチャ

```
インターネット
    ↓
┌─────────────────────┐
│ AWS CloudFront      │  ← CDN（フロントエンド配信）
└────────┬────────────┘
         ↓
┌─────────────────────┐
│ AWS S3              │  ← フロントエンド静的ファイル
│ + Next.js（静的生成）│
└─────────────────────┘

┌─────────────────────┐
│ AWS EC2             │  ← バックエンド（Flask/Django）
│ + Python 3.9+       │
└────────┬────────────┘
         ↓
┌─────────────────────┐
│ AWS RDS (MySQL)     │  ← マネージドデータベース
└─────────────────────┘
```

### デプロイ手順（概要）

**フロントエンド：**
1. Next.js をビルド
2. S3 に静的ファイルをアップロード
3. CloudFront でキャッシュ設定

**バックエンド：**
1. EC2 インスタンスにログイン
2. Git からコードをプル
3. Python 依存ライブラリをインストール
4. Gunicorn で起動
5. Nginx でリバースプロキシ設定

---

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**
