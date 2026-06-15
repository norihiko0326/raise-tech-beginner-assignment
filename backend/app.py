from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import json

app = Flask(__name__)
CORS(app)

# テストデータ（実装時はDBに変更）
MOCK_TRANSACTIONS = [
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
    },
    {
        "id": 3,
        "date": "2026-06-10",
        "amount": 2000,
        "type": "expense",
        "category": "交通費",
        "memo": "バス定期"
    }
]

MOCK_CATEGORIES = [
    {"id": 1, "name": "食費", "icon": "🍔", "is_default": True},
    {"id": 2, "name": "交通費", "icon": "🚌", "is_default": True},
    {"id": 3, "name": "娯楽費", "icon": "🎬", "is_default": True},
    {"id": 4, "name": "医療費", "icon": "💊", "is_default": True},
    {"id": 5, "name": "衣服費", "icon": "👕", "is_default": True},
    {"id": 6, "name": "家賃・住宅", "icon": "🏠", "is_default": True},
    {"id": 7, "name": "光熱費", "icon": "💡", "is_default": True},
    {"id": 8, "name": "通信費", "icon": "📱", "is_default": True},
    {"id": 9, "name": "仕事関連", "icon": "💼", "is_default": True},
    {"id": 10, "name": "その他", "icon": "🎁", "is_default": True},
    {"id": 11, "name": "給料", "icon": "💰", "is_default": True},
]


# ===== ヘルスチェック =====
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200


# ===== 収支 API =====
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """収支一覧を取得"""
    month = request.args.get('month')  # YYYY-MM 形式

    if month:
        filtered = [t for t in MOCK_TRANSACTIONS if t['date'].startswith(month)]
        return jsonify(filtered), 200

    return jsonify(MOCK_TRANSACTIONS), 200


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """新しい収支を作成"""
    data = request.get_json()

    # バリデーション（簡易版）
    if not data.get('date') or not data.get('amount') or not data.get('type') or not data.get('category'):
        return jsonify({"error": "必須項目が不足しています"}), 400

    new_transaction = {
        "id": max([t["id"] for t in MOCK_TRANSACTIONS]) + 1,
        "date": data['date'],
        "amount": data['amount'],
        "type": data['type'],
        "category": data['category'],
        "memo": data.get('memo', '')
    }

    MOCK_TRANSACTIONS.append(new_transaction)
    return jsonify(new_transaction), 201


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """収支を更新"""
    data = request.get_json()

    transaction = next((t for t in MOCK_TRANSACTIONS if t['id'] == transaction_id), None)
    if not transaction:
        return jsonify({"error": "取引が見つかりません"}), 404

    transaction.update(data)
    return jsonify(transaction), 200


@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """収支を削除"""
    global MOCK_TRANSACTIONS
    MOCK_TRANSACTIONS = [t for t in MOCK_TRANSACTIONS if t['id'] != transaction_id]
    return jsonify({"message": "削除しました"}), 200


# ===== 集計 API =====
@app.route('/api/summary/<year_month>', methods=['GET'])
def get_summary(year_month):
    """月別の収支サマリーを取得"""
    month_transactions = [t for t in MOCK_TRANSACTIONS if t['date'].startswith(year_month)]

    income = sum(t['amount'] for t in month_transactions if t['type'] == 'income')
    expense = sum(t['amount'] for t in month_transactions if t['type'] == 'expense')
    balance = income - expense

    return jsonify({
        "month": year_month,
        "income": income,
        "expense": expense,
        "balance": balance
    }), 200


@app.route('/api/chart-data', methods=['GET'])
def get_chart_data():
    """過去6ヶ月のグラフデータを取得"""
    today = datetime.now()
    data = []

    for i in range(6):
        month_date = today - timedelta(days=30*i)
        year_month = month_date.strftime('%Y-%m')

        month_transactions = [t for t in MOCK_TRANSACTIONS if t['date'].startswith(year_month)]
        income = sum(t['amount'] for t in month_transactions if t['type'] == 'income')
        expense = sum(t['amount'] for t in month_transactions if t['type'] == 'expense')

        data.append({
            "month": year_month,
            "income": income,
            "expense": expense
        })

    return jsonify(data[::-1]), 200


# ===== カテゴリ API =====
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """カテゴリ一覧を取得"""
    return jsonify(MOCK_CATEGORIES), 200


@app.route('/api/categories', methods=['POST'])
def create_category():
    """新しいカテゴリを作成"""
    data = request.get_json()

    if not data.get('name') or not data.get('icon'):
        return jsonify({"error": "カテゴリ名とアイコンは必須です"}), 400

    # 重複チェック
    if any(c['name'] == data['name'] for c in MOCK_CATEGORIES):
        return jsonify({"error": "カテゴリは既に存在します"}), 400

    new_category = {
        "id": max([c["id"] for c in MOCK_CATEGORIES]) + 1,
        "name": data['name'],
        "icon": data['icon'],
        "is_default": False
    }

    MOCK_CATEGORIES.append(new_category)
    return jsonify(new_category), 201


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    """カテゴリを削除"""
    global MOCK_CATEGORIES
    category = next((c for c in MOCK_CATEGORIES if c['id'] == category_id), None)

    if not category:
        return jsonify({"error": "カテゴリが見つかりません"}), 404

    if category['is_default']:
        return jsonify({"error": "初期カテゴリは削除できません"}), 400

    MOCK_CATEGORIES = [c for c in MOCK_CATEGORIES if c['id'] != category_id]
    return jsonify({"message": "削除しました"}), 200


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
    print("📚 API仕様: 下記のエンドポイントを参照")
    print("=" * 50)
    app.run(debug=True, host='127.0.0.1', port=5000)
