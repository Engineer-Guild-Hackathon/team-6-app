
勉強時間で争う# team6 完全感覚Gambler
---

## チーム情報
- チーム番号: 6
- チーム名: 完全感覚Gambler
- プロダクト名: Study Derby
- メンバー: use-hunks, Takimi-no

<p align="center">
  <a href="#-demo">デモ</a> ·
  <a href="#-features">機能</a> 
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-informational" />
  <img alt="Build" src="https://img.shields.io/badge/Build-Vite%20%2B%20React%20%2B%20TypeScript-blue" />
  <img alt="Backend" src="https://img.shields.io/badge/Backend-Supabase-success" />
  <img alt="CI" src="https://img.shields.io/badge/CI-GitHub%20Actions-lightgrey" />
</p>

---

## デモ　/ プレゼン資料
- デモURL: 
- プレゼンURL：https://docs.google.com/presentation/d/15e_TQGekyS0RtXwLuCOjE4s29yD-MwF77R8s5UbzYEQ/edit?slide=id.p#slide=id.p


---
## プロダクト概要
### Study Derby
> **学習を“通貨化”してベットする** ― 勉強時間で走る、週次レース型 × ベットコインの学習アプリ

---
## プロダクトの流れ
1. 勉強を記録
- ユーザはアプリで勉強開始・終了を入力（ストップウォッチ方式）
- 記録が完了すると、1分につき1Bet Coin（BC） が獲得できる
2. BCを貯める
- 勉強時間が増えるほどBCが貯まる
- ユーザは「努力＝通貨」という形で成果を実感できる
3. レースに参加 / ベット
- 貯めたBCを使って、1週間の勉強時間で競う「勉強レース」にベット
- 他のユーザにベットして応援できる
4. 結果で盛り上がる
- レース終了後、順位・オッズ・賞金BCが決定
- ランキングでユーザー同士が競い合う
- 勉強の成果が「勉強」と縁が少ない報酬・ゲーム体験として即時に返ってくる

---
## 📽️ デモ

---

## ✨ 機能
- ユーザー認証
- タイマーでの勉強記録
- レースにベット
- レースに参加 
- ランキング表示

---

## 🧱 技術スタック
| Layer | Choice |
|---|---|
| Frontend| React, Tailwind, Node.js, lucide-react|
| Build | Vite, TypeScript |
| Backend | Supabase (Auth, Database), Flask(予定)|

---
### 🔐 環境変数
```
// .env
VITE_SUPABASE_URL=https://{your_supabase_id}.supabase.co
VITE_SUPABASE_ANON_KEY={your_supabase_anon_key}
```
---

## 🗂️ プロジェクト構成

```
team-6-app
├── .devcontainer
│   └── devcontainer.json
├── backend
│   ├── app
│   │   ├── __pycache__
│   │   └── main.py
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── uv.lock
├── frontend
│   ├── public
│   │   └── favicon.ico
│   ├── src
│   │   ├── components
│   │   ├── contexts
│   │   ├── types
│   │   ├── utils
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── supabaseClient.ts
│   │   └── vite-env.d.ts
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── supabase
│   └── migrations
│       ├── 20250912051938_remote_schema.sql
│       ├── 20250912071036_remote_schema.sql
│       └── 20250912101414_remote_schema.sql
├── .env.development
├── .gitignore
├── compose.yml
└── README.md
```

---
## DBテーブル構成
- users
- subjects
- user-subjests (usersテーブルとsubjectsテーブルの中間テーブル)
- races
- races-participants
- bets
- study_sessions
- transactions

---
## 🚀 デプロイ
- Vercel

---
## 工夫したところ
- AIを用いて開発スピードを加速
	- 最初にbolt.newを用いてUIを作成し，これを起点にコードの改修を進めていく形式にすることでデザインを考える時間を減らすことができた
- Document管理にNotion, コミュニケーションツールにGahter, 開発環境はDocker, DBにSupabaseなど，実践的な環境で開発を行った


	

--- 
## 苦労したところ
- 適切なテーブル設計
    - 開発が進んでからテーブル設計にミスが生じていることが発覚し，コードの手戻りが発生するなど，コストがかかった
    - 入念な要件定義が重要であることを実感
    
---

## メンバー情報
| 名前 | 連絡先 |
|---|---|
| @use-hunks | `shunshu618@gmail.com` |
| @Takimi-no | `takipool.con@gmail.com` |

---
