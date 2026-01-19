# 技術的負債と設定見直しのIssue

## 概要

NextAuth v5への移行、Prisma 7への移行、および型エラーの解消が必要です。現在のコードベースはNextAuth v4とPrisma 6の形式で記述されており、最新バージョンへの移行とそれに伴う設定変更が必要です。

## 1. NextAuth v5への移行

### 問題点

- **現在の状態**: NextAuth v5 beta (`next-auth@^5.0.0-beta.25`)を使用しているが、v4の設定形式で記述されている
- **型エラー**: `NextAuthOptions`型が存在しない（v5では`NextAuthConfig`に変更）
- **設定ファイルの配置**: v5では設定をルートに配置し、`auth`, `handlers`, `signIn`, `signOut`をエクスポートする必要がある

### 影響範囲

- `src/lib/auth.ts`: NextAuthOptionsのインポートエラー、コールバックの型エラー
- `src/app/api/auth/[...nextauth]/route.ts`: 設定のエクスポート方法の変更が必要
- `src/lib/auth-utils.ts`: `getServerSession`の使用方法の変更が必要
- `src/middleware.ts`: ミドルウェアでの認証方法の変更が必要

### 具体的なエラー

```
src/lib/auth.ts:2:15: モジュール '"next-auth"' にはエクスポートされたメンバー 'NextAuthOptions' がありません。
src/lib/auth.ts:56:15: バインド要素 'token' には暗黙的に 'any' 型が含まれます。
src/lib/auth.ts:56:22: バインド要素 'user' には暗黙的に 'any' 型が含まれます。
src/lib/auth.ts:63:19: バインド要素 'session' には暗黙的に 'any' 型が含まれます。
src/lib/auth.ts:63:28: バインド要素 'token' には暗黙的に 'any' 型が含まれます。
```

### 必要な変更

1. **設定ファイルの再構成**
   - `auth.ts`をルートに配置
   - `NextAuthConfig`型を使用
   - `auth`, `handlers`, `signIn`, `signOut`をエクスポート

2. **APIルートの更新**
   - `route.ts`から`handlers`のみをエクスポート

3. **認証ユーティリティの更新**
   - `getServerSession`の代わりに`auth()`を使用

4. **ミドルウェアの更新**
   - `auth`をミドルウェアとして使用する方法に変更

## 2. Prisma 7への移行

### 問題点

- **現在の状態**: Prisma 7 (`prisma@^7.1.0`, `@prisma/client@^7.1.0`)を使用しているが、設定が不完全
- **prisma.config.ts**: `prisma/config`モジュールからのインポートが正しく動作していない可能性
- **Prisma Clientの生成パス**: `output`フィールドが必須だが、インポートパスが古い形式
- **ドライバーアダプター**: Prisma 7では必須だが、設定が不完全

### 影響範囲

- `prisma.config.ts`: `prisma/config`モジュールのインポートエラーの可能性
- `prisma/schema.prisma`: `output`フィールドの確認が必要
- `src/lib/prisma.ts`: Prisma Clientのインポートパスとアダプター設定の確認が必要

### 必要な変更

1. **prisma.config.tsの修正**
   - `prisma/config`からの正しいインポート
   - `defineConfig`または`satisfies PrismaConfig`の使用
   - `dotenv/config`のインポート（環境変数の明示的な読み込み）

2. **schema.prismaの確認**
   - `generator`ブロックに`output`フィールドが設定されているか確認
   - `provider = "prisma-client"`が設定されているか確認

3. **Prisma Clientのインポートパス更新**
   - `@prisma/client`から`./generated/prisma/client`への変更
   - または`prisma/generated/prisma/client`への変更（現在の設定に応じて）

4. **ドライバーアダプターの確認**
   - `@prisma/adapter-pg`が正しく設定されているか確認
   - アダプターのインスタンス化が正しいか確認

## 3. 型エラーの解消

### 問題点

- **NextAuth関連の型エラー**: 7件の型エラーが確認されている
- **Prisma関連の型エラー**: インポートパスや型定義の問題の可能性

### 具体的なエラー

#### NextAuth関連
1. `NextAuthOptions`型が存在しない
2. `credentials.email`と`credentials.password`の型が`{}`として推論されている
3. コールバック関数のパラメータが暗黙的に`any`型

#### 想定されるPrisma関連
- Prisma Clientのインポートパスの不一致
- 型定義ファイルの生成パスの問題

### 必要な変更

1. **NextAuthの型定義の修正**
   - `NextAuthConfig`型の使用
   - コールバック関数の明示的な型定義
   - `credentials`の型安全性の確保

2. **Prismaの型定義の確認**
   - 生成された型定義ファイルのパス確認
   - `prisma generate`の実行確認

## 優先順位

1. **高**: NextAuth v5への移行（型エラーの解消に直結）
2. **高**: Prisma 7の設定見直し（ビルドエラーの原因となる可能性）
3. **中**: 型エラーの個別対応（移行後に残るエラーの解消）

## 参考資料

- [NextAuth v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma Config Reference](https://prisma.io/docs/orm/reference/prisma-config-reference)

## 関連ファイル

- `src/lib/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth-utils.ts`
- `src/middleware.ts`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `package.json`


