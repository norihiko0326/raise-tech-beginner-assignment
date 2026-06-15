# セキュリティ・データ保護

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**

---

## セキュリティレベル

このドキュメントは **レベル A（基本）** のセキュリティ要件に基づいています。

---

## データベースセキュリティ

### 接続暗号化

- MySQL 接続時は **SSL/TLS** を使用する
- ローカル開発時でも有効化を推奨

**設定例（Flask）：**
```python
DATABASE_URL = "mysql+pymysql://user:password@localhost/household_db?ssl=true&ssl_verify_cert=false"
```

### パスワード管理

- DB ユーザーパスワード、API キー等は **環境変数** で管理
- コードハードコーディング禁止
- `.env` ファイルは `.gitignore` に追加

**例：**
```
DATABASE_URL=mysql+pymysql://user:password@localhost/household_db
SECRET_KEY=your-secret-key-here
```

### バックアップ

- 毎日自動バックアップを取得し、7日間保持
- 本番環境（AWS RDS）では自動バックアップ機能を有効化
- バックアップファイルはアクセス制限を設定

### アクセス制御

- DB にアクセスできるのは **バックエンド（Flask/Django）のみ**
- EC2 セキュリティグループで MySQL ポート（3306）を開かない
- 開発時のみローカルから接続可能

---

## API セキュリティ

### HTTPS 強制

- **本番環境では全 API を HTTPS で提供**
- HTTP から HTTPS への自動リダイレクト設定

**Nginx 設定例：**
```nginx
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ...
}
```

### CORS 設定

- フロントエンドオリジンのみを許可
- **ワイルドカード（*）は使用禁止**

**Flask 設定例：**
```python
from flask_cors import CORS

CORS(app, origins=["https://example.com"], methods=["GET", "POST", "PUT", "DELETE"])
```

### 入力バリデーション

- **すべての入力値をサーバー側で検証**
- クライアント側の検証のみに依存しない
- 想定外の値は拒否

**検証項目：**
- データ型チェック（文字列、数値など）
- 値の範囲チェック（日付は6ヶ月以内、金額は9,999,999以下）
- 文字列長チェック（メモは255文字以下）
- 特殊文字チェック（SQLインジェクション対策）

### SQL インジェクション対策

- **生 SQL は使用しない**
- ORM（SQLAlchemy など）を使用
- 必要な場合はパラメータ化クエリを使用

**安全な例（SQLAlchemy）：**
```python
from models import Transaction
results = Transaction.query.filter_by(date=input_date).all()
```

**危険な例（避ける）：**
```python
query = f"SELECT * FROM transactions WHERE date = '{input_date}'"
# この方法は使わない！
```

### レート制限

- 1 IP アドレスあたり **1分間に100リクエストを上限**
- DDoS 攻撃対策

**Flask-Limiter 使用例：**
```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/transactions', methods=['GET'])
@limiter.limit("100 per minute")
def get_transactions():
    # ...
```

---

## フロントエンド セキュリティ

### XSS（クロスサイトスクリプティング）対策

- **ユーザー入力は全て HTML エスケープして表示**
- React は自動的にエスケープするが、確認推奨

**安全な例（React）：**
```jsx
<p>{userInput}</p>  // 自動的にエスケープされる
```

**危険な例（避ける）：**
```jsx
<p dangerouslySetInnerHTML={{ __html: userInput }} />  // これは使わない！
```

### Content Security Policy（CSP）

- CSP ヘッダーを設定し、外部スクリプト読み込みを制限

**Next.js での設定例：**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ];
  }
};
```

### 安全な通信

- API 通信は **HTTPS のみ**
- ローカル開発時でも HTTPS 推奨

---

## 認証・認可

### 認証

- **ログイン機能なし**（1ユーザー専用）
- 本番環境では **IP アドレス制限** を推奨

**Nginx での IP 制限設定例：**
```nginx
location /api/ {
    allow 192.168.1.0/24;      # 許可する IP範囲
    deny all;                    # その他は拒否
}
```

### 認可

- なし（全ユーザーが全機能を利用可能）
- 将来的に複数ユーザー対応時に実装

---

## ログ・監査

### API ログ

- **すべての API リクエスト/レスポンスを記録**
- ただし、金額などの機密情報は一部マスク

**ログフォーマット例：**
```
[2026-06-15 12:30:45] POST /api/transactions - 201 - IP: 192.168.1.1
[2026-06-15 12:30:46] GET /api/transactions?month=2026-06 - 200 - IP: 192.168.1.1
```

### エラーログ

- エラーは詳細をログに出力
- ユーザーには一般的なメッセージのみ表示

**エラーレスポンス（ユーザー向け）：**
```json
{
  "error": "内部エラーが発生しました。サポートにお問い合わせください。"
}
```

**ログ（サーバー側）：**
```
[ERROR] 2026-06-15 12:30:45: DatabaseConnection Error - Connection refused
```

### ログ保持期間

- ログは **90日間保持**
- 本番環境では AWS CloudWatch Logs で一元管理

---

## 環境変数管理

### 管理対象

- DATABASE_URL（DBの接続文字列）
- SECRET_KEY（JWT署名用）
- FRONTEND_URL（フロントエンド URL）
- API_PORT（API ポート）

### 方法

**ローカル開発：**
- `.env` ファイルに記載
- `.gitignore` に追加してレポジトリに含めない

**例：**
```
DATABASE_URL=mysql+pymysql://household_user:password@localhost:3306/household_db
SECRET_KEY=your-development-secret-key
FRONTEND_URL=http://localhost:3000
API_PORT=5000
```

**本番環境：**
- **AWS Systems Manager Parameter Store** または **AWS Secrets Manager** で管理
- EC2 インスタンスが起動時に取得

**Secrets Manager での取得例（Python）：**
```python
import boto3

client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='household-app-secrets')
import json
credentials = json.loads(secret['SecretString'])
DATABASE_URL = credentials['DATABASE_URL']
```

---

## セキュリティチェックリスト

実装時に以下をチェック：

- [ ] HTTPS を本番環境で有効化
- [ ] CORS を正しく設定（フロントエンドオリジンのみ）
- [ ] 環境変数で機密情報を管理
- [ ] MySQL SSL/TLS 接続を有効化
- [ ] 入力値をサーバー側で検証
- [ ] ORM を使用してSQLインジェクションを防止
- [ ] ユーザー入力を HTML エスケープ
- [ ] API ログを記録
- [ ] レート制限を実装
- [ ] IP アドレス制限を本番で設定
- [ ] バックアップを毎日実施
- [ ] エラーメッセージにシステム情報を含めない

---

**[← REQUIREMENTS.md に戻る](../REQUIREMENTS.md)**
