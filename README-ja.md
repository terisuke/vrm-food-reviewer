# VRM Food Reviewer

**ステータス: ✅ 完了・本番環境対応済み**

VRMキャラクターによるAI生成食レビューアプリケーション。位置情報ベースのレストラン連携とソーシャル共有機能を搭載。リアルVRM 3Dキャラクター、Google AIによるレビュー生成、企業グレードのGCPサービスアカウント認証を使用。

## 🚀 クイックスタート

### 必要な環境
- Node.js ≥18.0.0
- npm ≥8.0.0
- GCPプロジェクト: `aipartner-426616` へのアクセス（サービスアカウント設定済み）
- VOICEVOXエンドポイント: `https://voicevox-proto-639959525777.asia-northeast2.run.app`

### インストール・セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone <repository-url>
   cd vrm-food-reviewer
   npm install
   ```

2. **環境変数の設定**
   ```bash
   # バックエンド環境変数
   cp packages/backend/.env.example packages/backend/.env
   
   # フロントエンド environment variables  
   cp packages/frontend/.env.example packages/frontend/.env
   ```

3. **サービスアカウントの設定**
   - GCPサービスアカウントのJSONキーを以下に配置:
     ```
     packages/backend/config/service-account-key.json
     ```
   - 適切なファイル権限を設定: `chmod 600 packages/backend/config/service-account-key.json`

4. **開発サーバーの起動**
   ```bash
   # バックエンドとフロントエンド両方を起動
   npm run dev
   
   # または個別に起動
   npm run dev --workspace=packages/backend   # ポート 3001
   npm run dev --workspace=packages/frontend  # ポート 3000
   ```

5. **アプリケーションへのアクセス**
   - フロントエンド: http://localhost:3000
   - バックエンドAPI: http://localhost:3001
   - ヘルスチェック: http://localhost:3001/api/health

### 主な機能 ✨
- **🤖 リアルタイムAI食レビュー生成** - Google Geminiとサービスアカウント認証を使用
- **🎭 リアルVRMキャラクター表情** - 感情同期機能付き（みすずキャラクター）
- **🎤 日本語音声合成** - VOICEVOX API経由
- **📍 位置情報連動レストラン検出** - Google Maps APIs使用
- **🐦 ワンクリックソーシャル共有** - Twitter用フォーマット済みコンテンツ
- **🔒 企業グレードセキュリティ** - GCPサービスアカウント認証
- **⚡ データベース不要** - 完全ステートレスアーキテクチャ

### プロジェクト構造
```
├── docs/                         # ドキュメント・実装ログ
│   ├── PRD.md                   # 製品要求仕様書
│   └── IMPLEMENTATION_LOG.md    # 完全な実装詳細
├── packages/
│   ├── shared/                  # 共通TypeScript型定義
│   ├── backend/                 # Express APIサーバー（GCP認証付き）
│   │   ├── config/             # サービスアカウントキー（gitignore済み）
│   │   └── src/                # バックエンドソースコード
│   └── frontend/               # React + Viteアプリケーション
│       ├── public/models/      # VRMキャラクターファイル
│       └── src/                # フロントエンドソースコード
├── CLAUDE.md                   # Claude Code向けドキュメント
└── package.json               # モノレポワークスペース設定
```

## 🎮 使用方法

### ユーザージャーニー
1. **📸 食べ物写真をアップロード** - ドラッグ&ドロップで食べ物画像をアップロード（JPEG/PNG、最大10MB）
2. **📍 位置情報を有効化** - レストラン検出のための位置情報アクセスを許可
3. **🏪 レストランを選択** - 近くのレストランから選択または手動検索
4. **🤖 AIレビューを生成** - 感情マーカー付きの情熱的な食レビューを作成
5. **🎭 VRMパフォーマンスを視聴** - みすずキャラクターがレビューを読みながら感情表現
6. **🎤 音声を再生** - 日本語音声合成の生成・再生
7. **🐦 Twitterに共有** - フォーマット済みコンテンツとハッシュタグでワンクリック共有

### APIエンドポイント
- `GET /api/health` - サービスヘルスチェック
- `POST /api/upload` - 食べ物画像のアップロード・検証
- `POST /api/review` - 感情マーカー付きAI食レビュー生成
- `POST /api/voice` - テキスト読み上げ合成
- `GET /api/places?lat=&lng=&radius=` - 近くのレストラン検索

## 🛠️ 開発コマンド

```bash
# 依存関係のインストール
npm install

# 開発モード（バックエンド・フロントエンド両方起動）
npm run dev

# 全パッケージのビルド
npm run build

# 型チェック
npm run typecheck

# リンティング
npm run lint

# ビルドファイルのクリーンアップ
npm run clean
```

## 📚 ドキュメント
- 📋 **[製品要求仕様書](./docs/PRD.md)** - 完全な仕様
- 📝 **[実装ログ](./docs/IMPLEMENTATION_LOG.md)** - 詳細な実装内容
- 🤖 **[Claude Codeガイド](./CLAUDE.md)** - AI支援開発ガイダンス
- 🏗️ **アーキテクチャ**: 外部AIサービス連携ステートレスReact + Express
- 🔧 **API**: Google Gemini、Google Maps、VOICEVOX

## 🚀 デプロイ準備完了

**本番環境デプロイ:**
- ✅ サービスアカウント認証設定済み
- ✅ 環境変数ドキュメント化済み
- ✅ ビルドプロセス最適化済み
- ✅ セキュリティベストプラクティス実装済み
- ✅ ヘルス監視エンドポイント利用可能

**次のステップ:**
1. バックエンドをRailway/Renderにサービスアカウント環境変数付きでデプロイ
2. フロントエンドをVercelにデプロイ
3. 本番環境変数を設定
4. 実データによる本番デプロイテスト

---

**🎉 完全に実装済み・本番デプロイ準備完了！**