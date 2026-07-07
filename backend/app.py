from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_db_connection():
    """MySQL データベース接続"""
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "admin"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "householdapp"),
    )


# ===== ヘルスチェック =====
@app.route('/health', methods=['GET'])
def health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500


# ===== 収支 API =====
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """収支一覧を取得"""
    month = request.args.get('month')

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if month:
            cursor.execute("""
                SELECT t.id, t.date, t.amount, t.type, c.name as category, c.icon, t.memo
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE DATE_FORMAT(t.date, '%Y-%m') = %s
                ORDER BY t.date DESC
            """, (month,))
        else:
            cursor.execute("""
                SELECT t.id, t.date, t.amount, t.type, c.name as category, c.icon, t.memo
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                ORDER BY t.date DESC
            """)

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """新しい収支を作成"""
    data = request.get_json()

    if not data.get('date') or not data.get('amount') or not data.get('type') or not data.get('category'):
        return jsonify({"error": "必須項目が不足しています"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # カテゴリID を取得
        cursor.execute("SELECT id FROM categories WHERE name = %s", (data['category'],))
        category_row = cursor.fetchone()

        if not category_row:
            cursor.close()
            conn.close()
            return jsonify({"error": "カテゴリが見つかりません"}), 400

        category_id = category_row['id']

        # トランザクション挿入
        cursor.execute("""
            INSERT INTO transactions (date, amount, type, category_id, memo)
            VALUES (%s, %s, %s, %s, %s)
        """, (data['date'], data['amount'], data['type'], category_id, data.get('memo', '')))

        conn.commit()
        transaction_id = cursor.lastrowid

        # 挿入したデータを取得
        cursor.execute("""
            SELECT t.id, t.date, t.amount, t.type, c.name as category, c.icon, t.memo
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = %s
        """, (transaction_id,))

        result = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify(result), 201

    except mysql.connector.IntegrityError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """収支を更新"""
    data = request.get_json()

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 既存トランザクションを確認
        cursor.execute("SELECT * FROM transactions WHERE id = %s", (transaction_id,))
        if not cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"error": "取引が見つかりません"}), 404

        # カテゴリIDを取得（カテゴリが指定されている場合）
        category_id = None
        if 'category' in data:
            cursor.execute("SELECT id FROM categories WHERE name = %s", (data['category'],))
            category_row = cursor.fetchone()
            if not category_row:
                cursor.close()
                conn.close()
                return jsonify({"error": "カテゴリが見つかりません"}), 400
            category_id = category_row['id']

        # 更新フィールドを構築
        update_fields = []
        params = []

        if 'date' in data:
            update_fields.append("date = %s")
            params.append(data['date'])
        if 'amount' in data:
            update_fields.append("amount = %s")
            params.append(data['amount'])
        if 'type' in data:
            update_fields.append("type = %s")
            params.append(data['type'])
        if category_id:
            update_fields.append("category_id = %s")
            params.append(category_id)
        if 'memo' in data:
            update_fields.append("memo = %s")
            params.append(data['memo'])

        if not update_fields:
            cursor.close()
            conn.close()
            return jsonify({"error": "更新するフィールドがありません"}), 400

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(transaction_id)

        cursor.execute(
            f"UPDATE transactions SET {', '.join(update_fields)} WHERE id = %s",
            params
        )
        conn.commit()

        # 更新後のデータを取得
        cursor.execute("""
            SELECT t.id, t.date, t.amount, t.type, c.name as category, c.icon, t.memo
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = %s
        """, (transaction_id,))

        result = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """収支を削除"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM transactions WHERE id = %s", (transaction_id,))

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"error": "取引が見つかりません"}), 404

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "削除しました"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== 集計 API =====
@app.route('/api/summary/<year_month>', methods=['GET'])
def get_summary(year_month):
    """月別の収支サマリーを取得"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE DATE_FORMAT(date, '%Y-%m') = %s
        """, (year_month,))

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        income = row['income'] or 0
        expense = row['expense'] or 0
        balance = income - expense

        return jsonify({
            "month": year_month,
            "income": income,
            "expense": expense,
            "balance": balance
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    """過去6ヶ月のグラフデータを取得"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 過去6ヶ月のデータを取得
        cursor.execute("""
            SELECT
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM transactions
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month
        """)

        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== カテゴリ API =====
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """カテゴリ一覧を取得"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, name, icon, is_default FROM categories ORDER BY is_default DESC, id")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/categories', methods=['POST'])
def create_category():
    """新しいカテゴリを作成"""
    data = request.get_json()

    if not data.get('name') or not data.get('icon'):
        return jsonify({"error": "カテゴリ名とアイコンは必須です"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "INSERT INTO categories (name, icon, is_default) VALUES (%s, %s, 0)",
            (data['name'], data['icon'])
        )
        conn.commit()
        category_id = cursor.lastrowid

        # 挿入したデータを取得
        cursor.execute("SELECT id, name, icon, is_default FROM categories WHERE id = %s", (category_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        return jsonify(result), 201

    except mysql.connector.IntegrityError:
        return jsonify({"error": "カテゴリは既に存在します"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """カテゴリを削除"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 初期カテゴリか確認
        cursor.execute("SELECT is_default FROM categories WHERE id = %s", (category_id,))
        row = cursor.fetchone()

        if not row:
            cursor.close()
            conn.close()
            return jsonify({"error": "カテゴリが見つかりません"}), 404

        if row['is_default']:
            cursor.close()
            conn.close()
            return jsonify({"error": "初期カテゴリは削除できません"}), 400

        cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "削除しました"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== エラーハンドリング =====
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "エンドポイントが見つかりません"}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "サーバーエラーが発生しました"}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Flask サーバーが起動しています...")
    print("=" * 50)
    print("📍 ローカルURL: http://localhost:5000")
    print("🏥 ヘルスチェック: http://localhost:5000/health")
    print("🗄️ データベース: MySQL (RDS)")
    print("=" * 50)
    app.run(debug=False, host='0.0.0.0', port=5000)
