# Flask バックエンド API エンドポイント仕様

現在のFlaskサーバーで実装されているAPIエンドポイント一覧です。

---

## 基本情報

| 項目 | 値 |
|------|-----|
| ベースURL | `http://localhost:5000` |
| 形式 | JSON |
| 認証 | なし（開発版） |

---

## ヘルスチェック

### GET /health

サーバーが正常に動作しているか確認します。

**リクエスト:**
```
GET http://localhost:5000/health
```

**レスポンス:**
```json
{
  "status": "healthy",
  "timestamp": "2026-06-15T11:00:00.000000"
}
```

---

## 収支（取引）API

### GET /api/transactions

収支一覧を取得します。

**クエリパラメータ:**
| パラメータ | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `month` | string | 対象月（YYYY-MM形式） | `2026-06` |

**リクエスト例:**
```
GET http://localhost:5000/api/transactions
GET http://localhost:5000/api/transactions?month=2026-06
```

**レスポンス:**
```json
[
  {
    "id": 1,
    "date": "2026-06-15",
    "amount": 1500,
    "type": "expense",
    "category": "食費",
    "memo": "ランチ"
  },
  {
    "id": 2,
    "date": "2026-06-14",
    "amount": 150000,
    "type": "income",
    "category": "給料",
    "memo": "月給"
  }
]
```

---

### POST /api/transactions

新しい収支を作成します。

**リクエストボディ:**
```json
{
  "date": "2026-06-15",
  "amount": 2000,
  "type": "expense",
  "category": "食費",
  "memo": "夕食"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date` | string | ✅ | 日付（YYYY-MM-DD） |
| `amount` | number | ✅ | 金額（1～9,999,999） |
| `type` | string | ✅ | 種類（`income` or `expense`） |
| `category` | string | ✅ | カテゴリ名 |
| `memo` | string | ❌ | メモ（最大255文字） |

**レスポンス:**
```json
{
  "id": 4,
  "date": "2026-06-15",
  "amount": 2000,
  "type": "expense",
  "category": "食費",
  "memo": "夕食"
}
```

**ステータスコード:**
- `201` — 作成成功
- `400` — バリデーションエラー

---

### PUT /api/transactions/{transaction_id}

収支を更新します。

**パスパラメータ:**
| パラメータ | 説明 |
|-----------|------|
| `transaction_id` | 取引ID |

**リクエストボディ:**
```json
{
  "amount": 3000,
  "memo": "夕食（修正）"
}
```

**レスポンス:**
```json
{
  "id": 4,
  "date": "2026-06-15",
  "amount": 3000,
  "type": "expense",
  "category": "食費",
  "memo": "夕食（修正）"
}
```

**ステータスコード:**
- `200` — 更新成功
- `404` — 取引が見つからない

---

### DELETE /api/transactions/{transaction_id}

収支を削除します。

**パスパラメータ:**
| パラメータ | 説明 |
|-----------|------|
| `transaction_id` | 取引ID |

**リクエスト:**
```
DELETE http://localhost:5000/api/transactions/4
```

**レスポンス:**
```json
{
  "message": "削除しました"
}
```

**ステータスコード:**
- `200` — 削除成功
- `404` — 取引が見つからない

---

## 集計API

### GET /api/summary/{year_month}

月別の収支サマリーを取得します。

**パスパラメータ:**
| パラメータ | 説明 |
|-----------|------|
| `year_month` | 対象月（YYYY-MM形式） |

**リクエスト:**
```
GET http://localhost:5000/api/summary/2026-06
```

**レスポンス:**
```json
{
  "month": "2026-06",
  "income": 150000,
  "expense": 7000,
  "balance": 143000
}
```

---

### GET /api/chart-data

過去6ヶ月のグラフデータを取得します。

**リクエスト:**
```
GET http://localhost:5000/api/chart-data
```

**レスポンス:**
```json
[
  {
    "month": "2026-01",
    "income": 200000,
    "expense": 150000
  },
  {
    "month": "2026-02",
    "income": 200000,
    "expense": 160000
  },
  ...
  {
    "month": "2026-06",
    "income": 150000,
    "expense": 7000
  }
]
```

---

## カテゴリAPI

### GET /api/categories

カテゴリ一覧を取得します。

**リクエスト:**
```
GET http://localhost:5000/api/categories
```

**レスポンス:**
```json
[
  {
    "id": 1,
    "name": "食費",
    "icon": "🍔",
    "is_default": true
  },
  {
    "id": 2,
    "name": "交通費",
    "icon": "🚌",
    "is_default": true
  },
  ...
  {
    "id": 11,
    "name": "給料",
    "icon": "💰",
    "is_default": true
  }
]
```

---

### POST /api/categories

新しいカテゴリを作成します。

**リクエストボディ:**
```json
{
  "name": "教育費",
  "icon": "🎓"
}
```

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `name` | string | ✅ | カテゴリ名（1～50文字） |
| `icon` | string | ✅ | 絵文字（1文字） |

**レスポンス:**
```json
{
  "id": 12,
  "name": "教育費",
  "icon": "🎓",
  "is_default": false
}
```

**ステータスコード:**
- `201` — 作成成功
- `400` — バリデーションエラー / 重複

---

### DELETE /api/categories/{category_id}

カテゴリを削除します。※初期カテゴリは削除不可

**パスパラメータ:**
| パラメータ | 説明 |
|-----------|------|
| `category_id` | カテゴリID |

**リクエスト:**
```
DELETE http://localhost:5000/api/categories/12
```

**レスポンス:**
```json
{
  "message": "削除しました"
}
```

**ステータスコード:**
- `200` — 削除成功
- `400` — 初期カテゴリは削除不可
- `404` — カテゴリが見つからない

---

## エラーハンドリング

### エラーレスポンス例

```json
{
  "error": "必須項目が不足しています"
}
```

### 一般的なステータスコード

| コード | 説明 |
|--------|------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request（バリデーションエラー） |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## テスト方法

### cURL でテスト

```bash
# ヘルスチェック
curl http://localhost:5000/health

# 収支一覧取得
curl http://localhost:5000/api/transactions?month=2026-06

# 新しい収支を作成
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-06-15","amount":2000,"type":"expense","category":"食費","memo":"test"}'

# カテゴリ一覧取得
curl http://localhost:5000/api/categories
```

### Postman でテスト

各エンドポイントをPostmanで試すこともできます。

---

## 次のステップ

現在はテストデータ（メモリ内）を使用しているため、サーバー再起動でリセットされます。本実装ではMySQLデータベースを接続します。

