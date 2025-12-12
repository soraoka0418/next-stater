# 報告書作成機能

## 概要

テンプレートを選択して報告書を作成する機能です。ステップ形式のウィザードで、テンプレート選択から報告書提出までをサポートします。

## 機能

### 1. テンプレート選択
- 公開されているテンプレートの一覧から選択
- テンプレート名と説明を表示
- 報告書のタイトルを入力

### 2. 動的フォーム生成
- 選択したテンプレートのフィールド定義に基づいてフォームを自動生成
- 対応しているフィールドタイプ:
  - `text`: テキスト入力
  - `textarea`: 複数行テキスト入力
  - `number`: 数値入力（単位、最小値、最大値、ステップ値に対応）
  - `date`: 日付選択
  - `select`: 選択肢から選択
  - `checkbox`: チェックボックス
- 必須フィールドのバリデーション（Zod使用）

### 3. 画像アップロード
- S3への画像アップロード機能
- ドラッグ&ドロップ対応
- 複数画像の一括アップロード
- JPEG、PNG、WebP形式に対応
- 最大10MBまで

### 4. 下書き保存
- 任意のタイミングで下書きとして保存可能
- フィールド入力後、画像アップロード前、プレビュー前のいずれでも保存可能
- 下書きは後から編集・提出可能

### 5. プレビュー機能
- 入力内容の確認画面
- タイトル、テンプレート名、入力内容を表示

### 6. 報告書提出
- 入力内容を確認後、報告書として提出
- 提出後は編集不可（下書きのみ編集可能）

## APIエンドポイント

### POST /api/reports
報告書を作成します。

**リクエストボディ:**
```json
{
  "templateId": "string",
  "title": "string",
  "fieldValues": {
    "fieldKey1": "value1",
    "fieldKey2": "value2"
  },
  "status": "draft" | "submitted"
}
```

**レスポンス:**
```json
{
  "report": {
    "id": "string",
    "templateId": "string",
    "templateVersionId": "string",
    "title": "string",
    "status": "draft" | "submitted",
    "fieldValues": [...],
    "images": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### PUT /api/reports/[id]
報告書を更新します（下書き保存・提出用）。

**リクエストボディ:**
```json
{
  "title": "string",
  "fieldValues": {
    "fieldKey1": "value1",
    "fieldKey2": "value2"
  },
  "status": "draft" | "submitted"
}
```

**レスポンス:**
```json
{
  "report": {
    "id": "string",
    "title": "string",
    "status": "draft" | "submitted",
    "fieldValues": [...],
    "images": [...]
  }
}
```

### GET /api/reports/[id]
報告書の詳細を取得します。

**レスポンス:**
```json
{
  "report": {
    "id": "string",
    "templateId": "string",
    "templateVersionId": "string",
    "title": "string",
    "status": "draft" | "submitted" | "approved" | "archived",
    "fieldValues": [...],
    "images": [...],
    "author": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  }
}
```

## ファイル構成

```
src/
├── app/
│   ├── (protected)/
│   │   └── reports/
│   │       └── new/
│   │           └── page.tsx          # 報告書作成ページ
│   └── api/
│       └── reports/
│           ├── route.ts             # 報告書作成API
│           └── [id]/
│               └── route.ts          # 報告書更新・取得API
└── features/
    └── report/
        └── components/
            └── report-form.tsx       # 報告書フォームコンポーネント
```

## 使用方法

### 1. 報告書作成ページにアクセス
`/reports/new` にアクセスします。

### 2. テンプレートを選択
公開されているテンプレートから選択し、報告書のタイトルを入力します。

### 3. フィールドに入力
テンプレートで定義されたフィールドに値を入力します。必須フィールドはバリデーションが行われます。

### 4. 画像をアップロード（任意）
報告書に添付する画像をアップロードします。ドラッグ&ドロップまたはファイル選択でアップロードできます。

### 5. 内容を確認
入力内容を確認します。

### 6. 下書き保存または提出
- **下書き保存**: 後で編集・提出するために下書きとして保存
- **報告書を提出**: 報告書として提出（提出後は編集不可）

## バリデーション

- テンプレート選択: 必須
- タイトル: 必須（1文字以上）
- 必須フィールド: テンプレートで定義された必須フィールドはすべて入力必須
- 数値フィールド: 最小値・最大値の範囲チェック
- テキストフィールド: 最大文字数チェック（設定されている場合）

## エラーハンドリング

- 認証エラー: 401 Unauthorized
- 権限エラー: 403 Forbidden
- バリデーションエラー: 400 Bad Request
- リソース不存在: 404 Not Found
- サーバーエラー: 500 Internal Server Error

## 注意事項

- 提出済みの報告書は編集できません
- 下書きのみ編集・提出が可能です
- 画像は報告書作成後（下書き保存後）にアップロードできます
- テンプレートは公開されているもののみ選択可能です

