# frontend/Dockerfile
FROM node:24-slim

WORKDIR /app

# package.json と lock ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install --legacy-peer-deps

# ソースコードをコピー
COPY . .

# 開発用コマンド（vite）
CMD ["npm", "run", "dev"]
