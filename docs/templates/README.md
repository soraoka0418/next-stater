# テンプレート管理機能

報告書テンプレートの管理機能のドキュメントです。

## 概要

報告書テンプレートの作成、編集、削除、プレビュー、検索・フィルタリング機能を提供します。管理者のみがテンプレートの作成・編集・削除を行うことができ、全ユーザーがテンプレートの一覧表示とプレビューを閲覧できます。

## 機能一覧

### テンプレート一覧表示
- テンプレートをカード形式で一覧表示
- 検索・フィルタリング機能（名前検索、ステータスフィルタ、ソート）
- 管理者は編集・削除ボタンが表示される

### テンプレート作成
- テンプレート名・説明の入力
- Tiptapを使用したリッチテキストエディタでコンテンツ編集
- 動的フィールドの定義（日付、場所、担当者など）
- ステータス設定（draft/published/archived）

### テンプレート編集
- 既存テンプレートの編集
- バージョン管理（編集時に新しいバージョンが作成される）
- コンテンツとフィールド定義の更新

### テンプレート削除
- テンプレートの削除（管理者のみ）
- 確認ダイアログ付き

### テンプレートプレビュー
- テンプレートのプレビュー表示
- Tiptap JSONをHTMLに変換して表示
- 動的フィールドの定義を表示

### 検索・フィルタリング
- テンプレート名での検索
- ステータス（draft/published/archived）でのフィルタリング
- 作成日でのソート（昇順・降順）
- URLパラメータと同期（nuqs使用）

## 技術スタック

### フロントエンド
- **Tiptap**: リッチテキストエディタ
  - `@tiptap/react`
  - `@tiptap/starter-kit`
  - `@tiptap/extension-placeholder`
- **React Hook Form**: フォーム管理
- **nuqs**: URL検索パラメータの状態管理
- **Shadcn UI**: UIコンポーネント（Card, Button, Input, Select等）

### バックエンド
- **Next.js App Router**: API Routes
- **Prisma**: データベースORM
- **NextAuth.js**: 認証・権限管理

## データベーススキーマ

既存のPrismaスキーマに以下のモデルが定義されています：

- `Template`: テンプレート基本情報
- `TemplateVersion`: バージョン管理（content: Json, status: draft/published/archived）
- `TemplateField`: 動的フィールド定義（key, label, inputType, required, order, config: Json）

## ファイル構成

### API Routes
- `src/app/api/templates/route.ts`: テンプレート一覧取得・作成
- `src/app/api/templates/[id]/route.ts`: テンプレート取得・更新・削除
- `src/app/api/templates/[id]/preview/route.ts`: プレビュー用データ取得

### ページコンポーネント
- `src/app/(protected)/templates/page.tsx`: テンプレート一覧ページ
- `src/app/(protected)/templates/new/page.tsx`: テンプレート作成ページ
- `src/app/(protected)/templates/[id]/edit/page.tsx`: テンプレート編集ページ
- `src/app/(protected)/templates/[id]/preview/page.tsx`: テンプレートプレビューページ

### 機能コンポーネント
- `src/features/template/components/template-list.tsx`: テンプレート一覧表示
- `src/features/template/components/template-card.tsx`: テンプレートカードコンポーネント
- `src/features/template/components/template-editor.tsx`: Tiptapエディタラッパー
- `src/features/template/components/template-form.tsx`: テンプレート作成・編集フォーム
- `src/features/template/components/field-editor.tsx`: 動的フィールド定義エディタ
- `src/features/template/components/template-preview.tsx`: テンプレートプレビュー表示
- `src/features/template/components/template-search.tsx`: 検索・フィルタリングUI

### 型定義
- `src/types/template.ts`: テンプレート関連の型定義

## 権限管理

### 管理者のみ可能な操作
- テンプレートの作成
- テンプレートの編集
- テンプレートの削除

### 全ユーザーが可能な操作
- テンプレート一覧の閲覧
- テンプレートプレビューの閲覧

### 実装方法
- API Routesで管理者権限チェックを実装
- ページコンポーネントで管理者権限チェックを実装
- ミドルウェアで`/templates/new`と`/templates/[id]/edit`を管理者専用ルートとして保護

## 動的フィールド

テンプレートには以下のタイプの動的フィールドを定義できます：

- `text`: テキスト入力
- `textarea`: 複数行テキスト入力
- `number`: 数値入力
- `date`: 日付入力
- `select`: 選択肢から選択
- `checkbox`: チェックボックス
- `signature`: 署名

各フィールドには以下の設定が可能です：
- 必須/任意
- ラベル
- 順序
- 拡張設定（選択肢、単位、プレースホルダー、最大長、最小値、最大値、ステップなど）

## 使用方法

### テンプレート一覧の表示
1. `/templates`にアクセス
2. 検索・フィルタリングを使用してテンプレートを絞り込み
3. カードをクリックしてプレビューを表示

### テンプレートの作成（管理者のみ）
1. `/templates/new`にアクセス
2. テンプレート名・説明を入力
3. Tiptapエディタでコンテンツを編集
4. 動的フィールドを定義
5. ステータスを選択
6. 保存

### テンプレートの編集（管理者のみ）
1. `/templates/[id]/edit`にアクセス
2. 既存の内容を編集
3. 保存（新しいバージョンが作成される）

### テンプレートの削除（管理者のみ）
1. テンプレート一覧または詳細ページから削除ボタンをクリック
2. 確認ダイアログで確認
3. 削除実行

## API仕様

### GET /api/templates
テンプレート一覧を取得

**クエリパラメータ:**
- `search`: 検索キーワード（テンプレート名）
- `status`: ステータスフィルタ（draft/published/archived）
- `sort`: ソート順（createdAt_asc/createdAt_desc）

**レスポンス:**
```json
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "currentVersion": {
        "id": "string",
        "version": "number",
        "status": "draft | published | archived",
        "content": {},
        "fields": []
      },
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

### POST /api/templates
テンプレートを作成（管理者のみ）

**リクエストボディ:**
```json
{
  "name": "string",
  "description": "string | null",
  "content": {},
  "fields": [
    {
      "key": "string",
      "label": "string",
      "inputType": "text | textarea | number | date | select | checkbox | signature",
      "required": "boolean",
      "order": "number",
      "config": {}
    }
  ],
  "status": "draft | published | archived"
}
```

### GET /api/templates/[id]
テンプレート詳細を取得

### PUT /api/templates/[id]
テンプレートを更新（管理者のみ）

**リクエストボディ:**
```json
{
  "name": "string",
  "description": "string | null",
  "content": {},
  "fields": [],
  "status": "draft | published | archived"
}
```

### DELETE /api/templates/[id]
テンプレートを削除（管理者のみ）

### GET /api/templates/[id]/preview
テンプレートプレビュー用データを取得

## 変更履歴

### 2024-12-XX
- テンプレート管理機能の初回実装
- Tiptapエディタの統合
- 動的フィールド定義機能の実装
- 検索・フィルタリング機能の実装
- 権限管理の実装

