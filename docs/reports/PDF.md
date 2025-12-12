# PDF生成機能

報告書をPDF形式で出力する機能の実装ドキュメントです。

## 概要

報告書の内容（タイトル、テンプレートコンテンツ、フィールド値、画像）をPDF形式で出力できます。ブラウザ内でのプレビュー表示とダウンロード機能を提供します。

## 機能

- **PDF生成**: 報告書の全データをPDF形式で生成
- **PDFダウンロード**: 生成したPDFをダウンロード
- **PDFプレビュー**: ブラウザ内でPDFをプレビュー表示
- **テンプレートコンテンツ対応**: Tiptap JSON形式のテンプレートコンテンツをPDFに変換
- **画像埋め込み**: S3に保存された画像をPDFに埋め込み
- **日本語対応**: 日本語テキストの表示に対応

## 技術スタック

- `@react-pdf/renderer`: ReactコンポーネントからPDFを生成するライブラリ
- Next.js App Router: API RouteでPDF生成エンドポイントを提供

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── [id]/
│   │           └── pdf/
│   │               └── route.ts          # PDF生成API Route
│   └── (protected)/
│       └── reports/
│           └── [id]/
│               ├── page.tsx              # 報告書詳細ページ（PDFプレビュー付き）
│               └── edit/
│                   └── page.tsx          # 報告書編集ページ（PDFダウンロードボタン付き）
└── features/
    └── report/
        ├── components/
        │   ├── pdf-download-button.tsx   # PDFダウンロードボタンコンポーネント
        │   └── pdf-preview.tsx           # PDFプレビューコンポーネント
        └── lib/
            └── pdf-generator.tsx          # PDF生成ライブラリ
```

## APIエンドポイント

### GET /api/reports/[id]/pdf

報告書のPDFを生成して返却します。

**認証**: 必要（報告書の作成者のみアクセス可能）

**レスポンス**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="[報告書タイトル]_[ID].pdf"`

**エラーレスポンス**:
- `401`: 認証が必要です
- `403`: この報告書にアクセスする権限がありません
- `404`: 報告書が見つかりません / テンプレートバージョンが見つかりません
- `500`: PDFの生成に失敗しました

## コンポーネント

### PDFDownloadButton

PDFダウンロードボタンコンポーネント。

**Props**:
- `reportId: string` - 報告書ID（必須）
- `title?: string` - ボタンに表示するテキスト（オプション、デフォルト: "PDFをダウンロード"）
- `variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"` - ボタンのバリアント
- `size?: "default" | "sm" | "lg" | "icon"` - ボタンのサイズ
- `className?: string` - 追加のCSSクラス

**使用例**:
```tsx
<PDFDownloadButton reportId="report-id" title="PDFをダウンロード" />
```

### PDFPreview

PDFプレビューコンポーネント。ブラウザ内でPDFを表示します。

**Props**:
- `reportId: string` - 報告書ID（必須）
- `title?: string` - PDFのタイトル（オプション）
- `className?: string` - 追加のCSSクラス

**使用例**:
```tsx
<PDFPreview reportId="report-id" title="報告書タイトル" />
```

## PDF生成ライブラリ

### PDFDocument

PDFドキュメントを生成するReactコンポーネント。

**Props**:
- `title: string` - 報告書のタイトル
- `templateName?: string` - テンプレート名
- `templateContent?: unknown` - テンプレートコンテンツ（Tiptap JSON形式）
- `fields: TemplateField[]` - テンプレートフィールド
- `fieldValues: Record<string, unknown>` - フィールド値
- `images: ReportImage[]` - 報告書画像

## PDFレイアウト

PDFは以下の順序で構成されます：

1. **タイトル**: 報告書のタイトル（中央揃え、24pt、太字）
2. **テンプレート名**: 使用したテンプレート名（セクションタイトル付き）
3. **本文**: テンプレートコンテンツ（Tiptap JSONから変換）
4. **入力内容**: フィールド値の一覧（ラベルと値のペア）
5. **添付画像**: S3に保存された画像（キャプション付き）

## Tiptap JSON変換

Tiptap JSON形式のコンテンツをPDFコンポーネントに変換します。

**対応ノードタイプ**:
- `doc`: ドキュメントルート
- `paragraph`: 段落
- `heading`: 見出し（レベル1-3）
- `bulletList`: 箇条書きリスト
- `orderedList`: 番号付きリスト
- `listItem`: リスト項目
- `text`: テキスト（太字、斜体に対応）
- `hardBreak`: 改行

## 画像埋め込み

S3に保存された画像をPDFに埋め込みます。

- 画像はS3 URLから直接読み込まれます
- 最大幅は100%、最大高さは300pxに制限されます
- 画像のキャプションが設定されている場合は表示されます
- 画像の読み込みに失敗した場合、エラーが発生します

## 日本語フォント対応

現在はデフォルトフォントを使用しています。日本語が正しく表示されない場合は、以下の手順でフォントを追加してください：

1. フォントファイル（例: Noto Sans JP）を `public/fonts/` に配置
2. `src/features/report/lib/pdf-generator.tsx` のフォント登録コメントを参考に、フォントを登録

```tsx
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP-Regular.ttf",
})
```

3. スタイル定義でフォントファミリーを指定

```tsx
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    // ...
  },
})
```

## エラーハンドリング

### PDF生成エラー

PDF生成時にエラーが発生した場合：
- API Routeでエラーログを出力
- 500エラーレスポンスを返却
- クライアント側でエラーメッセージを表示

### 画像読み込みエラー

画像の読み込みに失敗した場合：
- `@react-pdf/renderer`のImageコンポーネントがエラーを処理
- PDF生成は続行されますが、該当画像は表示されません

## 使用例

### 報告書詳細ページでの使用

```tsx
// src/app/(protected)/reports/[id]/page.tsx
import { PDFDownloadButton } from "@/features/report/components/pdf-download-button"
import { PDFPreview } from "@/features/report/components/pdf-preview"

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params
  // ... 報告書データ取得
  
  return (
    <div>
      <PDFDownloadButton reportId={id} />
      <PDFPreview reportId={id} title={report.title} />
    </div>
  )
}
```

### 報告書編集ページでの使用

```tsx
// src/app/(protected)/reports/[id]/edit/page.tsx
import { PDFDownloadButton } from "@/features/report/components/pdf-download-button"

export default async function ReportEditPage({ params }: ReportEditPageProps) {
  const { id } = await params
  // ... 報告書データ取得
  
  return (
    <div>
      <PDFDownloadButton reportId={id} />
      {/* その他の編集UI */}
    </div>
  )
}
```

## パフォーマンス

- PDF生成はサーバーサイドで実行されます
- 画像の読み込みは非同期で行われます
- 大きな画像の場合は、PDF生成に時間がかかる可能性があります

## 制限事項

- 日本語フォントはシステムフォントに依存します（カスタムフォントを追加することを推奨）
- 画像のサイズ制限はありませんが、大きな画像はPDF生成に時間がかかります
- PDFのページサイズはA4固定です

## 今後の改善案

- [ ] カスタムフォントの追加（Noto Sans JPなど）
- [ ] PDFページサイズの設定可能化
- [ ] 画像の自動リサイズ機能
- [ ] PDFテンプレートのカスタマイズ機能
- [ ] バッチPDF生成機能

