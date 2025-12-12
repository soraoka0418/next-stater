# S3画像アップロード機能

レポート作成/編集ページで使用する画像アップロード機能の実装ドキュメントです。

## 概要

AWS S3への画像アップロード、プレビュー、削除機能を実装しました。レポートに画像を添付し、S3に保存して管理できます。

## 実装内容

### 1. 依存関係

- `@aws-sdk/client-s3` - AWS S3クライアント

### 2. 環境変数

以下の環境変数を`.env.local`に設定してください：

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### 3. ファイル構成

```
src/
├── lib/
│   ├── s3.ts                          # S3クライアント設定とヘルパー関数
│   └── image-constants.ts             # 画像関連の共通定数
├── types/
│   └── report.ts                      # レポート関連の型定義
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── [id]/
│   │           └── images/
│   │               ├── route.ts       # 画像アップロードAPI
│   │               └── [imageId]/
│   │                   └── route.ts   # 画像削除API
│   └── (protected)/
│       └── reports/
│           └── [id]/
│               └── edit/
│                   └── page.tsx       # レポート編集ページ
└── features/
    └── report/
        └── components/
            ├── image-uploader.tsx     # 画像アップロードコンポーネント
            ├── image-preview.tsx      # 画像プレビューコンポーネント
            └── report-image-manager.tsx # 画像管理統合コンポーネント
```

### 4. 機能詳細

#### 4.1 画像アップロードAPI

**エンドポイント**: `POST /api/reports/[id]/images`

- 複数ファイル対応
- ファイル形式バリデーション（JPEG, PNG, WebP）
- ファイルサイズバリデーション（最大10MB）
- S3へのアップロード
- `ReportImage`レコードの作成
- 認証・権限チェック（レポート作成者のみ）

#### 4.2 画像削除API

**エンドポイント**: `DELETE /api/reports/[id]/images/[imageId]`

- S3からのファイル削除
- `ReportImage`レコードの削除
- 認証・権限チェック（レポート作成者のみ）
- S3削除失敗時はDBレコードも削除せず、エラーを返す（データ整合性を保証）

#### 4.3 画像アップロードコンポーネント

`ImageUploader`コンポーネントの機能：

- 複数ファイル選択対応
- ドラッグ&ドロップ対応
- アップロード前プレビュー（FileReader使用）
- アップロード進捗表示（ローディングスピナー）
- エラーハンドリングとトースト通知
- ファイルサイズ・形式のクライアント側バリデーション

#### 4.4 画像プレビューコンポーネント

`ImagePreview`コンポーネントの機能：

- アップロード済み画像の表示
- 画像削除ボタン
- グリッドレイアウト
- キャプション表示（オプション）

### 5. 技術仕様

#### ファイル形式

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

#### ファイルサイズ制限

- 最大10MB/ファイル

#### S3キー命名規則

```
reports/{reportId}/{timestamp}-{randomId}.{ext}
```

例: `reports/clx1234567890/1701234567890-abc123def456.jpg`

#### エラーハンドリング

- ファイル形式エラー
- ファイルサイズエラー
- S3アップロードエラー（詳細なエラーメッセージ）
- ネットワークエラー
- 認証エラー
- 部分的なアップロード失敗時の処理

### 6. データベーススキーマ

`ReportImage`モデルを使用：

```prisma
model ReportImage {
  id        String  @id @default(cuid())
  report    Report  @relation(fields: [reportId], references: [id])
  reportId  String
  s3Key     String
  s3Url     String
  caption   String?
  order     Int
  createdAt DateTime @default(now())

  @@index([reportId])
}
```

### 7. 使用方法

#### レポート編集ページ

`/reports/[id]/edit`にアクセスすると、画像アップロード機能が利用できます。

1. 画像をドラッグ&ドロップまたはクリックして選択
2. プレビューを確認
3. 「アップロード」ボタンをクリック
4. アップロード済み画像は自動的に表示される
5. 画像を削除する場合は、画像の右上の×ボタンをクリック

### 8. セキュリティ

- 認証チェック：すべてのAPI Routeで認証が必要
- 権限チェック：レポートの作成者のみ画像をアップロード/削除可能
- ファイル形式バリデーション：サーバー側とクライアント側の両方で実施
- ファイルサイズ制限：サーバー側とクライアント側の両方で実施

### 9. コード改善（2024年12月）

以下の改善を実施しました：

- **型定義の共通化**: `src/types/report.ts`に`ReportImage`インターフェースを集約し、重複を解消
- **定数の共通化**: `src/lib/image-constants.ts`に画像関連の定数を集約し、保守性を向上
- **エラーハンドリングの改善**: 画像削除APIでS3削除失敗時にDBレコードも削除しないように変更し、データ整合性を保証
- **メモリリーク対策**: `ImageUploader`コンポーネントの`useEffect`を最適化し、アンマウント時のみクリーンアップを実行
- **状態管理の改善**: `ReportImageManager`コンポーネントで`initialImages`の変更を監視し、自動的に状態を更新

### 10. 今後の拡張予定

- 画像リサイズ機能（オプション）
- 画像の並び替え機能
- 画像のキャプション編集機能
- 画像の一括削除機能

## トラブルシューティング

### Prisma型エラーについて

`src/app/(protected)/reports/[id]/edit/page.tsx`で`@ts-expect-error`を使用していますが、これはTypeScriptの型キャッシュの問題によるものです。実際には`prisma.report`は存在し、API Routeでも同様のコードが正常に動作しています。

解決方法：
- TypeScriptサーバーを再起動
- Prismaクライアントを再生成（`npx prisma generate`）

