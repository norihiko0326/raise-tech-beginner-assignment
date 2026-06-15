# バックエンド（Flask REST API）

**作成日：** 2026年6月15日

家計簿アプリのバックエンドです。要件定義書の仕様に基づいて、REST APIを実装しました。フロントエンドからのHTTPリクエストを受け取り、ビジネスロジック処理を行います。

---

## 📌 プロジェクト概要

| 項目 | 内容 |
|------|------|
| **技術スタック** | Flask 2.3.0 + Python 3.9+ |
| **API形式** | REST（JSON） |
| **バージョン** | 1.0（開発版） |
| **起動URL** | `http://localhost:5000` |

---

## ✨ 実装した機能

### ✅ REST API（全実装）

| エンドポイント | メソッド | 説明 |
|-------------|---------|------|
| `/health` | GET | サーバーヘルスチェック |
| `/api/transactions` | GET | 収支一覧取得（月別フィルタ対応） |
| `/api/transactions` | POST | 新規収支作成 |
| `/api/transactions/{id}` | PUT | 収支編集 |
| `/api/transactions/{id}` | DELETE | 収支削除 |
| `/api/summary/{year_month}` | GET | 月別収支サマリー（収入・支出・残高） |
| `/api/chart-data` | GET | グラフデータ（過去6ヶ月） |
| `/api/categories` | GET | カテゴリ一覧取得 |
| `/api/categories` | POST | カテゴリ作成 |
| `/api/categories/{id}` | DELETE | カテゴリ削除（初期カテゴリ除外） |

### ✅ その他機能

- CORS対応（フロントエンドからのアクセス許可）
- エラーハンドリング（404, 500など）
- テストデータの用意（サーバー起動直後から動作確認可能）

---

## ⏳ フェーズ2以降の計画

- MySQL データベース接続
- Flask-SQLAlchemy でのORM実装
- データの永続化

---

## 📋 ファイル構成

| ファイル | 説明 |
|---------|------|
| `app.py` | Flask アプリケーション本体（全APIエンドポイント実装） |
| `requirements.txt` | Python依存ライブラリ |
| `API_ENDPOINTS.md` | API仕様書（詳細） |
| `README.md` | このファイル |

---

## 🚀 セットアップ

### 前提条件
- Python 3.9 以上

### 実行手順

```bash
# 1. 仮想環境を作成
python -m venv venv

# 2. 仮想環境をアクティベート（Windows）
venv\Scripts\activate.bat

# 3. 依存ライブラリをインストール
pip install -r requirements.txt

# 4. サーバーを起動
python app.py
```

起動成功時の出力：
```
🚀 Flask サーバーが起動しています...
📍 ローカルURL: http://localhost:5000
🏥 ヘルスチェック: http://localhost:5000/health
```

---

## 📚 API仕様

全APIエンドポイントの詳細仕様（リクエスト/レスポンスのフォーマット、バリデーション等）は [API_ENDPOINTS.md](API_ENDPOINTS.md) を参照してください。

---

## 🧪 動作確認方法

### curlでテスト

```bash
# ヘルスチェック
curl http://localhost:5000/health

# 収支一覧取得
curl http://localhost:5000/api/transactions?month=2026-06

# カテゴリ一覧取得
curl http://localhost:5000/api/categories
```

### Postmanでテスト

Postmanでも各エンドポイントをテストできます。

---

## 🔧 技術選定理由

| 項目 | 選定 | 理由 |
|------|------|------|
| **フレームワーク** | Flask | 軽量で学習曲線が緩く、本スコープに最適。Django は過剰な機能を持つため不選定 |
| **言語** | Python | 読みやすく、初心者向け。技術スタック要件で指定 |
| **API形式** | REST | シンプルで理解しやすい。要件定義書で指定 |

---

## 💡 工夫点

- **テストデータの用意** — サーバー起動直後から動作確認可能。フロントエンド開発時のダミーデータとして機能
- **詳細なAPI仕様書** — フロントエンド開発者向けのリファレンス。リクエスト/レスポンス形式、バリデーション、エラーコード等を明記
- **CORS対応** — フロントエンド（異なるオリジン）からのHTTPリクエストに対応
- **エラーレスポンス統一** — JSON形式で統一し、クライアント側のエラー処理を簡素化

---

