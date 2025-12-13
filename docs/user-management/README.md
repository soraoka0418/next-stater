# ユーザー管理機能

## 概要

管理者がユーザーを管理する機能です。ユーザー一覧表示、作成、編集、論理削除、権限管理、検索・フィルタリング機能を提供します。

## 機能

### 1. ユーザー一覧表示
- ユーザー一覧をカード形式で表示
- メールアドレス、名前、ロール、作成日、更新日を表示
- 削除済みユーザーはデフォルトで非表示（オプションで表示可能）

### 2. ユーザー作成
- メールアドレス（必須）
- 名前（任意）
- ロール（admin/user、デフォルト: user）
- パスワード（任意、後で設定可能）

### 3. ユーザー編集
- メールアドレス、名前、ロールの編集
- パスワードの変更（変更する場合のみ入力）

### 4. ユーザー削除（論理削除）
- `deletedAt`フィールドを設定して論理削除
- 自分自身を削除することはできない
- 削除済みユーザーは認証時にログイン不可

### 5. 権限管理
- 管理者（admin）と一般ユーザー（user）の2つのロール
- 管理者のみがユーザー管理機能にアクセス可能
- 一般ユーザーは自分の情報のみ閲覧・編集可能

### 6. 検索・フィルタリング
- メールアドレスと名前で検索
- ロール（admin/user）でフィルタリング
- 削除済みユーザーの表示/非表示を切り替え

## APIエンドポイント

### GET /api/users
ユーザー一覧を取得します。

**クエリパラメータ:**
- `search` (string, 任意): メールアドレスまたは名前で検索
- `role` (string, 任意): ロールでフィルタリング（admin/user）
- `deleted` (string, 任意): 削除済みユーザーを含むか（true/false、デフォルト: false）

**認証:** 管理者権限が必要

**レスポンス:**
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "name": "string | null",
      "role": "string",
      "emailVerified": "Date | null",
      "image": "string | null",
      "createdAt": "Date",
      "updatedAt": "Date",
      "deletedAt": "Date | null"
    }
  ]
}
```

### POST /api/users
新しいユーザーを作成します。

**認証:** 管理者権限が必要

**リクエストボディ:**
```json
{
  "email": "string",
  "name": "string (optional)",
  "role": "admin | user",
  "password": "string (optional)"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "role": "string",
    "emailVerified": "Date | null",
    "image": "string | null",
    "createdAt": "Date",
    "updatedAt": "Date",
    "deletedAt": "Date | null"
  }
}
```

### GET /api/users/[id]
ユーザー詳細を取得します。

**認証:** 管理者権限が必要

**レスポンス:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "role": "string",
    "emailVerified": "Date | null",
    "image": "string | null",
    "createdAt": "Date",
    "updatedAt": "Date",
    "deletedAt": "Date | null"
  }
}
```

### PATCH /api/users/[id]
ユーザー情報を更新します。

**認証:** 管理者権限が必要

**リクエストボディ:**
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "role": "admin | user (optional)",
  "password": "string (optional)"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "role": "string",
    "emailVerified": "Date | null",
    "image": "string | null",
    "createdAt": "Date",
    "updatedAt": "Date",
    "deletedAt": "Date | null"
  }
}
```

### DELETE /api/users/[id]
ユーザーを論理削除します。

**認証:** 管理者権限が必要

**注意:** 自分自身を削除することはできません。

**レスポンス:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string | null",
    "role": "string",
    "emailVerified": "Date | null",
    "image": "string | null",
    "createdAt": "Date",
    "updatedAt": "Date",
    "deletedAt": "Date"
  }
}
```

## ページ

### /admin/users
ユーザー一覧ページ。検索・フィルタリング機能付き。

### /admin/users/new
ユーザー作成ページ。

### /admin/users/[id]
ユーザー編集ページ。

## データベーススキーマ

### Userモデルの変更
- `deletedAt`フィールドを追加（`DateTime?`）
- 論理削除をサポート

```prisma
model User {
  // ... 既存のフィールド
  deletedAt     DateTime?
}
```

## セキュリティ

- すべてのAPIエンドポイントで管理者権限チェックを実施
- 削除済みユーザーは認証時にログイン不可（`src/lib/auth.ts`でチェック）
- 自分自身を削除することはできない
- パスワードは`bcryptjs`でハッシュ化して保存

## 実装詳細

### コンポーネント

- `UserList`: ユーザー一覧表示コンポーネント（検索・フィルタリングUI含む）
- `UserForm`: ユーザー作成・編集フォーム（React Hook Form + Zod）

### 型定義

`src/types/user.ts`に以下の型定義を追加：
- `User`: ユーザー情報の型
- `CreateUserRequest`: ユーザー作成リクエストの型
- `UpdateUserRequest`: ユーザー更新リクエストの型
- `UserListQuery`: ユーザー一覧クエリの型

### 技術スタック

- React Hook Form + Zod（バリデーション）
- Prisma（データベース操作）
- Next.js App Router（サーバーコンポーネント）
- Shadcn UI（UIコンポーネント）
- nuqs（URL検索パラメータの状態管理）

## 使用方法

### ユーザー作成

1. `/admin/users/new`にアクセス
2. メールアドレス、名前、ロールを入力
3. パスワードは任意（後で設定可能）
4. 「作成する」ボタンをクリック

### ユーザー編集

1. `/admin/users`でユーザー一覧を表示
2. 編集したいユーザーの「編集」ボタンをクリック
3. 情報を編集
4. パスワードを変更する場合は新しいパスワードを入力
5. 「更新する」ボタンをクリック

### ユーザー削除

1. `/admin/users`でユーザー一覧を表示
2. 削除したいユーザーの「削除」ボタンをクリック
3. 確認ダイアログで「OK」をクリック

### 検索・フィルタリング

1. `/admin/users`で検索・フィルタカードを使用
2. 検索ボックスにメールアドレスまたは名前を入力
3. ロールでフィルタリング
4. 削除済みユーザーを表示する場合は「削除済み」を「表示する」に設定

## マイグレーション

```bash
npx prisma migrate deploy
```

または

```bash
npx prisma migrate dev
```

## 注意事項

- 論理削除は`deletedAt`フィールドを使用
- 削除済みユーザーはデフォルトで一覧に表示しない（`deleted`パラメータで表示可能）
- パスワードは任意（作成時・編集時ともに）
- 管理者権限チェックはすべてのエンドポイントとページで実施

