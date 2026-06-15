# API 仕様

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**

---

## 概要

バックエンド（Python Flask/Django）が提供する REST API。フロントエンドはこれらのエンドポイントを呼び出してデータを取得・保存します。

**ベースURL：** `http://localhost:5000` （ローカル開発時）/ `https://api.example.com` （本番環境）

**レスポンス形式：** JSON

---

## 取引記録関連 API

### GET /api/transactions

指定月のすべての取引記録を取得

**パラメータ：**
```
month: YYYY-MM 形式（例：2026-06）
```

**リクエスト例：**
```
GET /api/transactions?month=2026-06
```

**レスポンス（成功 200）：**
```json
{
  "data": [
    {
      "id": 1,
      "date": "2026-06-15",
      "amount": 1500,
      "type": "expense",
      "category_id": 1,
      "category_name": "食費",
      "category_icon": "🍔",
      "memo": "昼食"
    },
    {
      "id": 2,
      "date": "2026-06-14",
      "amount": 150000,
      "type": "income",
      "category_id": 11,
      "category_name": "給料",
      "category_icon": "💼",
      "memo": null
    }
  ]
}
```

**エラーレスポンス（400）：**
```json
{
  "error": "Invalid month format. Use YYYY-MM."
}
```

---

### POST /api/transactions

新しい取引記録を保存

**リクエストボディ：**
```json
{
  "date": "2026-06-15",
  "amount": 1500,
  "type": "expense",
  "category_id": 1,
  "memo": "昼食"
}
```

**バリデーション：**
- date：YYYY-MM-DD 形式、過去6ヶ月～今日の範囲
- amount：1～9,999,999
- type：「income」または「expense」
- category_id：既存カテゴリのID
- memo：最大255文字（オプション）

**レスポンス（成功 201）：**
```json
{
  "message": "記録を保存しました",
  "id": 1
}
```

**エラーレスポンス（400）：**
```json
{
  "errors": [
    "金額は1～9,999,999の範囲で入力してください",
    "6ヶ月以上前の日付は入力できません"
  ]
}
```

---

### PUT /api/transactions/:id

既存の取引記録を編集

**パラメータ：**
```
id: 取引記録ID
```

**リクエストボディ：**
```json
{
  "date": "2026-06-15",
  "amount": 2000,
  "type": "expense",
  "category_id": 1,
  "memo": "夜食に変更"
}
```

**レスポンス（成功 200）：**
```json
{
  "message": "記録を更新しました"
}
```

**エラーレスポンス（404）：**
```json
{
  "error": "記録が見つかりません"
}
```

---

### DELETE /api/transactions/:id

取引記録を削除

**パラメータ：**
```
id: 取引記録ID
```

**レスポンス（成功 200）：**
```json
{
  "message": "記録を削除しました"
}
```

**エラーレスポンス（404）：**
```json
{
  "error": "記録が見つかりません"
}
```

---

## カテゴリ関連 API

### GET /api/categories

すべてのカテゴリを取得

**リクエスト例：**
```
GET /api/categories
```

**レスポンス（成功 200）：**
```json
{
  "data": [
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
    {
      "id": 11,
      "name": "教育費",
      "icon": "🎓",
      "is_default": false
    }
  ]
}
```

---

### POST /api/categories

新しいカテゴリを追加

**リクエストボディ：**
```json
{
  "name": "教育費",
  "icon": "🎓"
}
```

**バリデーション：**
- name：1～50文字、重複不可
- icon：絵文字1文字

**レスポンス（成功 201）：**
```json
{
  "message": "カテゴリを追加しました",
  "id": 11
}
```

**エラーレスポンス（400）：**
```json
{
  "error": "このカテゴリ名は既に存在します"
}
```

---

### DELETE /api/categories/:id

ユーザー作成カテゴリを削除

**パラメータ：**
```
id: カテゴリID
```

**制約：**
- 初期カテゴリ（is_default=true）は削除不可
- このカテゴリを使用している取引記録は自動的にカテゴリが削除される

**レスポンス（成功 200）：**
```json
{
  "message": "カテゴリを削除しました"
}
```

**エラーレスポンス（400）：**
```json
{
  "error": "初期カテゴリは削除できません"
}
```

**エラーレスポンス（404）：**
```json
{
  "error": "カテゴリが見つかりません"
}
```

---

## 集計関連 API

### GET /api/summary

指定月の集計情報を取得

**パラメータ：**
```
month: YYYY-MM 形式（例：2026-06）
```

**リクエスト例：**
```
GET /api/summary?month=2026-06
```

**レスポンス（成功 200）：**
```json
{
  "month": "2026-06",
  "income": 200000,
  "expense": 150000,
  "balance": 50000
}
```

---

### GET /api/chart

過去Nヶ月のグラフ用データを取得

**パラメータ：**
```
months: 取得月数（例：6）。デフォルト6ヶ月
```

**リクエスト例：**
```
GET /api/chart?months=6
```

**レスポンス（成功 200）：**
```json
{
  "data": [
    {
      "month": "2026-01",
      "income": 150000,
      "expense": 100000
    },
    {
      "month": "2026-02",
      "income": 160000,
      "expense": 110000
    },
    {
      "month": "2026-03",
      "income": 170000,
      "expense": 120000
    },
    {
      "month": "2026-04",
      "income": 180000,
      "expense": 130000
    },
    {
      "month": "2026-05",
      "income": 190000,
      "expense": 140000
    },
    {
      "month": "2026-06",
      "income": 200000,
      "expense": 150000
    }
  ]
}
```

---

## エラーハンドリング

### 共通エラーレスポンス

**サーバーエラー（500）：**
```json
{
  "error": "Internal server error"
}
```

**未認可（401）：** ※現在は実装しないが、今後認証機能追加時に対応
```json
{
  "error": "Unauthorized"
}
```

**リソース未検出（404）：**
```json
{
  "error": "Not found"
}
```

---

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**
