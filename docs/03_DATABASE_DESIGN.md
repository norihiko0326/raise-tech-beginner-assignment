# データベース設計

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**

---

## ER 図（Entity-Relationship Diagram）

```
┌─────────────────────────────┐
│       categories            │
├─────────────────────────────┤
│ id (PK)         INTEGER     │
│ name            VARCHAR(50) │
│ icon            VARCHAR(10) │
│ is_default      BOOLEAN     │
│ created_at      TIMESTAMP   │
└─────────────────────────────┘
           △
           │
           │ 1:N
           │
           │ category_id (FK)
           │
┌─────────────────────────────┐
│      transactions           │
├─────────────────────────────┤
│ id (PK)         INTEGER     │
│ date            DATE        │
│ amount          DECIMAL     │
│ type            VARCHAR(20) │
│ category_id (FK)INTEGER     │
│ memo            VARCHAR(255)│
│ created_at      TIMESTAMP   │
│ updated_at      TIMESTAMP   │
└─────────────────────────────┘
```

**関係説明：**
- **1 : N 関係**：1つのカテゴリに対して、複数の取引記録が紐付く
- **参照整合性**：transactions.category_id は categories.id を参照
- **削除時の動作**：ユーザー作成カテゴリ削除時、そのカテゴリの記録は自動的に該当カテゴリIDを削除（※設計決定：記録自体は削除しない）

---

## テーブル定義

### テーブル 1：transactions（取引記録）

日々の収入・支出のすべての記録を保存

| 列名 | データ型 | 制約 | 説明 |
|------|--------|------|------|
| **id** | INTEGER | PRIMARY KEY AUTO_INCREMENT | 記録ID（自動採番） |
| **date** | DATE | NOT NULL | 取引日 |
| **amount** | DECIMAL(10,2) | NOT NULL | 金額（¥） |
| **type** | VARCHAR(20) | NOT NULL | 「income」（収入）or「expense」（支出） |
| **category_id** | INTEGER | NOT NULL FK | カテゴリID（categoriesテーブルとリンク） |
| **memo** | VARCHAR(255) | NULL | メモ（任意） |
| **created_at** | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 記録作成日時 |
| **updated_at** | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 記録更新日時 |

**インデックス：**
- PRIMARY KEY: id
- FOREIGN KEY: category_id → categories(id)
- INDEX: date（月別で取得するため）
- INDEX: created_at

**例：**
```
id | date       | amount | type    | category_id | memo        | created_at
1  | 2026-06-15 | 1500   | expense | 1           | 昼食        | 2026-06-15 12:00:00
2  | 2026-06-14 | 150000 | income  | 11          | 給料        | 2026-06-14 09:00:00
```

---

### テーブル 2：categories（カテゴリ）

支出・収入のカテゴリを管理

| 列名 | データ型 | 制約 | 説明 |
|------|--------|------|------|
| **id** | INTEGER | PRIMARY KEY AUTO_INCREMENT | カテゴリID |
| **name** | VARCHAR(50) | NOT NULL UNIQUE | カテゴリ名（例：「食費」）。重複不可 |
| **icon** | VARCHAR(10) | NOT NULL | 絵文字（例：「🍔」） |
| **is_default** | BOOLEAN | NOT NULL DEFAULT false | 初期カテゴリか？（true/false） |
| **created_at** | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | 作成日時 |

**インデックス：**
- PRIMARY KEY: id
- UNIQUE: name

**例：**
```
id | name      | icon | is_default | created_at
1  | 食費      | 🍔   | true       | 2026-01-01 00:00:00
2  | 交通費    | 🚌   | true       | 2026-01-01 00:00:00
3  | 娯楽費    | 🎬   | true       | 2026-01-01 00:00:00
...
11 | 教育費    | 🎓   | false      | 2026-06-10 10:00:00
```

---

## 初期カテゴリデータ

アプリケーション起動時に自動的に挿入される初期カテゴリ：

| name | icon | is_default |
|------|------|-----------|
| 食費 | 🍔 | true |
| 交通費 | 🚌 | true |
| 娯楽費 | 🎬 | true |
| 医療費 | 💊 | true |
| 衣服費 | 👕 | true |
| 家賃・住宅 | 🏠 | true |
| 光熱費 | 💡 | true |
| 通信費 | 📱 | true |
| 仕事関連 | 💼 | true |
| その他 | 🎁 | true |

---

## SQL スクリプト

### テーブル作成

```sql
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category_id INT NOT NULL,
    memo VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_date (date),
    INDEX idx_created_at (created_at)
);
```

### 初期カテゴリ挿入

```sql
INSERT INTO categories (name, icon, is_default) VALUES
('食費', '🍔', TRUE),
('交通費', '🚌', TRUE),
('娯楽費', '🎬', TRUE),
('医療費', '💊', TRUE),
('衣服費', '👕', TRUE),
('家賃・住宅', '🏠', TRUE),
('光熱費', '💡', TRUE),
('通信費', '📱', TRUE),
('仕事関連', '💼', TRUE),
('その他', '🎁', TRUE);
```

---

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**
