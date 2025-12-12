import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import type React from "react"
import type { ReportImage } from "@/types/report"
import type { TemplateField } from "@/types/template"

// 日本語フォントの登録
// 本番環境では、Noto Sans JPなどのフォントファイルをローカルに配置して使用することを推奨
// 現在はシステムフォントを使用（日本語対応のフォントがシステムにインストールされている場合）
// フォントファイルを追加する場合は以下のように登録:
// Font.register({
//   family: "NotoSansJP",
//   src: "/fonts/NotoSansJP-Regular.ttf",
// })
// 現在はデフォルトフォントを使用（日本語が正しく表示されない場合は上記の方法でフォントを追加してください）

// PDFスタイル定義
const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 12,
		lineHeight: 1.6,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		borderBottom: "1px solid #000",
		paddingBottom: 5,
	},
	fieldContainer: {
		marginBottom: 15,
	},
	fieldLabel: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 5,
		color: "#666",
	},
	fieldValue: {
		fontSize: 12,
		marginBottom: 10,
	},
	imageContainer: {
		marginBottom: 20,
		textAlign: "center",
	},
	image: {
		maxWidth: "100%",
		maxHeight: 300,
		marginBottom: 5,
	},
	imageCaption: {
		fontSize: 10,
		color: "#666",
		marginTop: 5,
	},
	content: {
		marginBottom: 15,
	},
	paragraph: {
		marginBottom: 10,
	},
	heading1: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
		marginTop: 15,
	},
	heading2: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 12,
	},
	heading3: {
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 6,
		marginTop: 10,
	},
	list: {
		marginLeft: 20,
		marginBottom: 10,
	},
	listItem: {
		marginBottom: 5,
	},
})

interface TiptapNode {
	type: string
	content?: TiptapNode[]
	text?: string
	attrs?: Record<string, unknown>
}

interface PDFGeneratorProps {
	title: string
	templateName?: string
	templateContent?: unknown // Tiptap JSON
	fields: TemplateField[]
	fieldValues: Record<string, unknown>
	images: ReportImage[]
}

function formatValue(value: unknown, field: TemplateField): string {
	if (value === undefined || value === null || value === "") {
		return "（未入力）"
	}

	switch (field.inputType) {
		case "checkbox":
			return typeof value === "boolean" ? (value ? "はい" : "いいえ") : String(value)
		case "date":
			if (typeof value === "string") {
				try {
					const date = new Date(value)
					return new Intl.DateTimeFormat("ja-JP", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}).format(date)
				} catch {
					return String(value)
				}
			}
			return String(value)
		case "number":
			if (typeof value === "number") {
				const config = field.config as { unit?: string } | null
				return config?.unit ? `${value} ${config.unit}` : String(value)
			}
			return String(value)
		default:
			return String(value)
	}
}

function renderTiptapNode(node: TiptapNode, index: number = 0): React.ReactElement | null {
	if (!node) return null

	const key = `node-${index}-${node.type}`

	switch (node.type) {
		case "paragraph": {
			const paragraphContent = node.content?.map((child, i) => renderTiptapNode(child, i)).filter(Boolean) || [
				<Text key="empty"> </Text>,
			]
			return (
				<View key={key} style={styles.paragraph}>
					{paragraphContent}
				</View>
			)
		}
		case "heading": {
			const level = (node.attrs?.level as number) || 1
			const headingStyle = level === 1 ? styles.heading1 : level === 2 ? styles.heading2 : styles.heading3
			const headingContent = node.content?.map((child, i) => renderTiptapNode(child, i)).filter(Boolean) || []
			return (
				<View key={key} style={headingStyle}>
					{headingContent}
				</View>
			)
		}
		case "bulletList":
		case "orderedList": {
			const listContent = node.content?.map((child, i) => renderTiptapNode(child, i)).filter(Boolean) || []
			return (
				<View key={key} style={styles.list}>
					{listContent}
				</View>
			)
		}
		case "listItem": {
			const listItemContent = node.content?.map((child, i) => renderTiptapNode(child, i)).filter(Boolean) || []
			return (
				<View key={key} style={styles.listItem}>
					<Text>• </Text>
					{listItemContent}
				</View>
			)
		}
		case "text": {
			const text = node.text || ""
			// テキストのスタイル属性を処理（bold, italicなど）
			const marks = node.attrs as { bold?: boolean; italic?: boolean } | undefined
			const textStyle: { fontWeight?: string; fontStyle?: string } = {}
			if (marks?.bold) textStyle.fontWeight = "bold"
			if (marks?.italic) textStyle.fontStyle = "italic"
			return (
				<Text key={key} style={textStyle}>
					{text}
				</Text>
			)
		}
		case "hardBreak":
			return <Text key={key}>{"\n"}</Text>
		default:
			if (node.content) {
				const defaultContent = node.content.map((child, i) => renderTiptapNode(child, i)).filter(Boolean)
				return <View key={key}>{defaultContent}</View>
			}
			return null
	}
}

function renderTiptapContent(content: unknown): React.ReactElement[] {
	if (!content || typeof content !== "object") {
		return []
	}

	const tiptapContent = content as { type?: string; content?: TiptapNode[] }

	if (tiptapContent.type === "doc" && tiptapContent.content) {
		return tiptapContent.content
			.map((node, index) => renderTiptapNode(node, index))
			.filter(Boolean) as React.ReactElement[]
	}

	// docタイプでない場合でも、contentが配列なら直接処理
	if (Array.isArray(tiptapContent)) {
		return tiptapContent.map((node, index) => renderTiptapNode(node, index)).filter(Boolean) as React.ReactElement[]
	}

	return []
}

export function PDFDocument({ title, templateName, templateContent, fields, fieldValues, images }: PDFGeneratorProps) {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* タイトル */}
				<Text style={styles.title}>{title}</Text>

				{/* テンプレート名 */}
				{templateName && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>テンプレート</Text>
						<Text style={styles.fieldValue}>{templateName}</Text>
					</View>
				)}

				{/* テンプレートコンテンツ（Tiptap JSON） */}
				{templateContent && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>本文</Text>
						<View style={styles.content}>{renderTiptapContent(templateContent)}</View>
					</View>
				)}

				{/* フィールド値 */}
				{fields.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>入力内容</Text>
						{fields.map((field) => {
							const value = fieldValues[field.key]
							return (
								<View key={field.id} style={styles.fieldContainer}>
									<Text style={styles.fieldLabel}>{field.label}</Text>
									<Text style={styles.fieldValue}>{formatValue(value, field)}</Text>
								</View>
							)
						})}
					</View>
				)}

				{/* 画像 */}
				{images.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>添付画像</Text>
						{images.map((image) => (
							<View key={image.id} style={styles.imageContainer}>
								<Image src={image.s3Url} style={styles.image} cache={false} />
								{image.caption && <Text style={styles.imageCaption}>{image.caption}</Text>}
							</View>
						))}
					</View>
				)}
			</Page>
		</Document>
	)
}
