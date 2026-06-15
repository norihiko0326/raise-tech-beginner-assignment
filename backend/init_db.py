"""
SQLite データベース初期化スクリプト
categories と transactions テーブルを作成し、初期カテゴリデータを挿入します。
"""

import sqlite3
from pathlib import Path

# データベースファイルのパス
DB_PATH = Path(__file__).parent / "household.db"

def init_database():
    """データベースを初期化"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    try:
        # categories テーブル作成
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE,
                icon VARCHAR(10) NOT NULL,
                is_default BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # transactions テーブル作成
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
                category_id INTEGER NOT NULL,
                memo VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
        """)

        # インデックス作成
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name)")

        # 初期カテゴリデータ
        initial_categories = [
            ('食費', '🍔', 1),
            ('交通費', '🚌', 1),
            ('娯楽費', '🎬', 1),
            ('医療費', '💊', 1),
            ('衣服費', '👕', 1),
            ('家賃・住宅', '🏠', 1),
            ('光熱費', '💡', 1),
            ('通信費', '📱', 1),
            ('仕事関連', '💼', 1),
            ('その他', '🎁', 1),
        ]

        # 既存データをチェック
        cursor.execute("SELECT COUNT(*) FROM categories")
        count = cursor.fetchone()[0]

        if count == 0:
            # 初期カテゴリを挿入
            cursor.executemany(
                "INSERT INTO categories (name, icon, is_default) VALUES (?, ?, ?)",
                initial_categories
            )
            print("✅ 初期カテゴリを挿入しました")
        else:
            print("ℹ️ カテゴリは既に存在します。スキップします。")

        conn.commit()
        print("✅ データベース初期化が完了しました")
        print(f"📁 データベースファイル: {DB_PATH}")

    except sqlite3.Error as e:
        print(f"❌ エラー: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    init_database()
