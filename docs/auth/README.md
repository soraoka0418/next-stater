# 認証システム実装概要

NextAuth.js v5 (Auth.js) を使用したユーザー認証・認可システムの実装ドキュメントです。

## 概要

本システムは、Credentials Providerによるメールアドレス・パスワード認証、JWTベースのセッション管理、ロールベースのアクセス制御（RBAC）を実装しています。

### 主な機能

- **ログイン機能**: メールアドレスとパスワードによる認証
- **ログアウト機能**: セッションの無効化
- **セッション管理**: JWTベースの軽量なセッション管理
- **保護されたルート**: 認証が必要なページの自動リダイレクト
- **権限管理**: 管理者/一般ユーザーのロールベースアクセス制御

## アーキテクチャ

```mermaid
flowchart TD
    A[ユーザー] -->|ログイン| B[LoginForm]
    B -->|POST /api/auth/signin| C[NextAuth.js Credentials Provider]
    C -->|認証| D[Prisma User Model]
    D -->|パスワード検証| E[bcryptjs]
    E -->|成功| F[セッション作成]
    F -->|JWT| G[NextAuth.js Session]
    G -->|保護されたルート| H[Middleware]
    H -->|認証チェック| I[Protected Routes]
    I -->|権限チェック| J[Role-based Access]
```

## 実装詳細

### 1. 認証プロバイダー

**Credentials Provider**を使用してメールアドレスとパスワードによる認証を実装しています。

- パスワードは`bcryptjs`でハッシュ化して保存
- 認証時にハッシュ化されたパスワードと比較
- 認証成功時にJWTトークンにユーザー情報とロールを含める

### 2. セッション管理

- **戦略**: JWT（JSON Web Token）
- **利点**: データベースに依存しない軽量な実装
- **有効期限**: NextAuth.jsのデフォルト設定に従う

### 3. 保護されたルート

以下のルートが保護されています：

- `/dashboard` - ダッシュボード（認証必須）
- `/profile` - プロフィール（認証必須）
- `/admin` - 管理者ページ（認証 + 管理者ロール必須）

### 4. ミドルウェア

`src/middleware.ts`で以下の処理を実装：

- 保護されたルートへのアクセス時に認証チェック
- 未認証ユーザーをログインページにリダイレクト（元のURLを`callbackUrl`として保持）
- 管理者ルートへのアクセス時にロールチェック
- 既にログインしているユーザーがログインページにアクセスした場合、ダッシュボードにリダイレクト

## ファイル構成

### コアファイル

```
src/
├── lib/
│   ├── auth.ts              # NextAuth.js設定（Credentials Provider、コールバック）
│   ├── auth-utils.ts        # セッション取得ユーティリティ
│   └── prisma.ts            # Prismaクライアントのシングルトンインスタンス
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts # NextAuth.js APIルート
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx     # ログインページ
│   ├── (protected)/
│   │   ├── layout.tsx       # 保護されたルートのレイアウト（セッション確認）
│   │   ├── dashboard/
│   │   │   └── page.tsx     # ダッシュボード
│   │   ├── profile/
│   │   │   └── page.tsx     # プロフィール
│   │   └── admin/
│   │       └── page.tsx     # 管理者ページ
│   └── layout.tsx           # ルートレイアウト（Toaster含む）
├── features/
│   └── auth/
│       └── components/
│           ├── login-form.tsx    # ログインフォーム（react-hook-form + zod）
│           └── logout-button.tsx # ログアウトボタン
├── middleware.ts            # 認証ミドルウェア
└── types/
    └── next-auth.d.ts       # NextAuth.js型定義の拡張
```

### Prismaスキーマ

`prisma/schema.prisma`に以下のモデルが追加されています：

- `Account` - OAuthプロバイダー用（将来の拡張）
- `Session` - NextAuth.js用のセッション（既存の`ApiSession`とは別）
- `VerificationToken` - パスワードリセット用（将来の拡張）
- `ApiSession` - 既存のAPI用セッション（tokenベース）

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定：

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cleaning_app"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

**重要**: `NEXTAUTH_SECRET`は本番環境で強力なランダム文字列に変更してください。

### 3. Prismaマイグレーション

```bash
# マイグレーションの実行
npx prisma migrate dev --name add_nextauth_models

# Prismaクライアントの生成
npx prisma generate
```

### 4. テストユーザーの作成

データベースに直接ユーザーを作成するか、シードスクリプトを使用：

```typescript
// 例: Prisma Studioで手動作成
// または、シードスクリプトを作成
```

パスワードは`bcryptjs`でハッシュ化する必要があります：

```typescript
import { hash } from "bcryptjs"

const passwordHash = await hash("your-password", 10)
```

## 使用方法

### ログイン

1. `/login`にアクセス
2. メールアドレスとパスワードを入力
3. 認証成功後、`callbackUrl`または`/dashboard`にリダイレクト

### ログアウト

`LogoutButton`コンポーネントを使用：

```tsx
import { LogoutButton } from "@/features/auth/components/logout-button"

<LogoutButton />
```

### セッション取得

#### サーバーコンポーネント

```tsx
import { getServerSession } from "@/lib/auth-utils"

export default async function Page() {
  const session = await getServerSession()
  
  if (!session) {
    // 未認証
  }
  
  return <div>Hello, {session.user.email}</div>
}
```

#### クライアントコンポーネント

```tsx
"use client"

import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return <div>Hello, {session.user.email}</div>
}
```

### 保護されたルートの作成

`(protected)`ルートグループ内にページを作成すると、自動的に認証チェックが行われます：

```tsx
// src/app/(protected)/your-page/page.tsx
import { getServerSession } from "@/lib/auth-utils"

export default async function YourPage() {
  const session = await getServerSession()
  // セッションは既に確認済み（layout.tsxでチェック）
  
  return <div>Protected content</div>
}
```

### 管理者専用ページの作成

管理者ロールのチェックを追加：

```tsx
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"

export default async function AdminPage() {
  const session = await getServerSession()
  
  if (!session || session.user.role !== "admin") {
    redirect("/dashboard")
  }
  
  return <div>Admin content</div>
}
```

## 型定義

NextAuth.jsの型定義を拡張して、ユーザー情報とロールを含めています：

```typescript
// src/types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
  
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
```

## セキュリティ考慮事項

1. **パスワードハッシュ化**: `bcryptjs`を使用してパスワードをハッシュ化
2. **セッション管理**: JWTを使用した軽量なセッション管理
3. **CSRF保護**: NextAuth.jsが自動的に処理
4. **環境変数**: 機密情報は環境変数で管理
5. **ミドルウェア**: 保護されたルートへのアクセスを自動的にチェック

## 今後の拡張候補

- [ ] パスワードリセット機能（`VerificationToken`モデルを使用）
- [ ] OAuthプロバイダー（Google、GitHubなど）の追加
- [ ] 二要素認証（2FA）
- [ ] メール認証（`emailVerified`フィールドを使用）
- [ ] セッション管理画面（アクティブセッションの確認・削除）
- [ ] ログイン履歴の記録
- [ ] アカウントロック機能（連続ログイン失敗時）

## トラブルシューティング

### ログインできない

1. データベースにユーザーが存在するか確認
2. パスワードが正しくハッシュ化されているか確認
3. 環境変数（`NEXTAUTH_SECRET`、`DATABASE_URL`）が正しく設定されているか確認

### セッションが取得できない

1. ブラウザのCookieが有効か確認
2. `NEXTAUTH_URL`が正しく設定されているか確認
3. ミドルウェアの設定を確認

### 保護されたルートにアクセスできない

1. ミドルウェアの`matcher`設定を確認
2. セッションが正しく作成されているか確認
3. ブラウザの開発者ツールでリダイレクトを確認

## 関連ドキュメント

- [NextAuth.js公式ドキュメント](https://next-auth.js.org/)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [データベース設計](./database/README.md)

