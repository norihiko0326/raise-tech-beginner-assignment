@echo off
echo ==========================================
echo Flask バックエンド セットアップスクリプト
echo ==========================================
echo.

REM 仮想環境を作成
echo [1/3] 仮想環境を作成中...
python -m venv venv
if errorlevel 1 (
    echo ERROR: 仮想環境の作成に失敗しました
    pause
    exit /b 1
)
echo OK: 仮想環境を作成しました
echo.

REM 仮想環境をアクティベート
echo [2/3] 仮想環境をアクティベート中...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: 仮想環境のアクティベーションに失敗しました
    pause
    exit /b 1
)
echo OK: 仮想環境をアクティベートしました
echo.

REM 依存ライブラリをインストール
echo [3/3] 依存ライブラリをインストール中...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: ライブラリのインストールに失敗しました
    pause
    exit /b 1
)
echo OK: ライブラリをインストールしました
echo.

echo ==========================================
echo セットアップが完了しました！
echo ==========================================
echo.
echo 次のコマンドでサーバーを起動してください:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python app.py
echo.
pause
