# backend/Dockerfile
FROM python:3.12-slim

# uv をインストール
RUN pip install uv

WORKDIR /app

# uv で依存関係を解決
COPY pyproject.toml ./
RUN uv pip install -r pyproject.toml --system

# ソースコードをコピー
COPY app ./app

# FastAPI + Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
