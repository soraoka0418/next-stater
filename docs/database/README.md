# データベース設計（PostgreSQL / Prisma）

清掃報告書管理システムのデータモデルと運用指針です。拡張性を優先し、テンプレートのバージョン管理と動的フィールドを前提にしています。

## 方針
- RSC中心の構成を想定し、API Route経由でDBアクセス。
- テンプレートはバージョン管理し、報告書は利用時点のテンプレートバージョンへ固定参照。
- フィールド定義はJSONベースで拡張（選択肢や単位などを`config`に格納）。
- 画像はS3保管し、DBには`key`/`url`とメタ情報のみ保持。

## 主要エンティティ
- `User`: ユーザー/権限。`role`は文字列（`admin`/`user`など）で柔軟に。
- `Template`: テンプレート本体。`currentVersion`で最新版を指す。
- `TemplateVersion`: バージョンごとの定義。`content`にレイアウトJSON、`fields`で入力項目。
- `TemplateField`: 動的フィールド定義。`inputType`と`config`で拡張。
- `Report`: 報告書本体。`templateVersion`を固定参照し、`status`でワークフローを管理。
- `ReportFieldValue`: 動的フィールドの入力値。`value`をJSONで保持。
- `ReportImage`: S3画像のメタ情報。
- `AuditLog`: 操作履歴。

## ステータスと推奨値
- テンプレート: `draft` | `published` | `archived`
- 報告書: `draft` | `submitted` | `approved` | `archived`
- ユーザー権限: 文字列で管理（例: `admin`/`user`）。将来的なロール追加に柔軟。

## Prismaスキーマ
`prisma/schema.prisma` に定義しています。PostgreSQLを使用します。
接続文字列例: `DATABASE_URL="postgresql://user:password@localhost:5432/cleaning_app"`

### モデル間リレーション概要
- User 1:N Template (TemplateAuthor)
- User 1:N Report (ReportAuthor)
- Template 1:N TemplateVersion
- TemplateVersion 1:N TemplateField
- TemplateVersion 1:N Report (Reportは固定バージョンを参照)
- Report 1:N ReportFieldValue
- Report 1:N ReportImage
- User 1:N AuditLog (任意)

## 運用メモ
- マイグレーション: `npx prisma migrate dev --name init`
- クライアント生成: `npx prisma generate`
- シードデータ: `prisma/seed.ts`（後続で追加予定）

## 今後の拡張候補
- 部門/拠点テーブル（マルチテナンシー対応）
- テンプレートの承認フロー（公開前レビュー）
- 報告書の承認/差戻し履歴テーブル
- 署名フィールド（手書き/画像）用の専用テーブル or フィールドタイプ追加

