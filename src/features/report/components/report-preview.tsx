"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ReportImage } from "@/types/report"
import type { Template, TemplateField } from "@/types/template"
import { ImagePreview } from "./image-preview"

interface ReportPreviewProps {
	template: Template | null
	title: string
	fieldValues: Record<string, unknown>
	fields: TemplateField[]
	images: ReportImage[]
	reportId: string | null
	onImageDelete?: (imageId: string) => void
	className?: string
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

export function ReportPreview({
	template,
	title,
	fieldValues,
	fields,
	images,
	reportId,
	onImageDelete,
	className,
}: ReportPreviewProps) {
	return (
		<div className={cn("space-y-4", className)}>
			<Card className="sticky top-4">
				<CardHeader>
					<CardTitle>プレビュー</CardTitle>
					<CardDescription>入力内容のプレビューを表示しています</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* タイトル */}
					<div>
						<h3 className="text-sm font-semibold text-muted-foreground mb-1">タイトル</h3>
						<p className="text-base">{title || "（未入力）"}</p>
					</div>

					{/* テンプレート */}
					{template && (
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-1">テンプレート</h3>
							<p className="text-base">{template.name}</p>
							{template.description && <p className="text-sm text-muted-foreground mt-1">{template.description}</p>}
						</div>
					)}

					{/* フィールド値 */}
					{fields.length > 0 && (
						<div>
							<h3 className="text-sm font-semibold text-muted-foreground mb-2">入力内容</h3>
							<div className="space-y-3">
								{fields.map((field) => {
									const value = fieldValues[field.key]
									return (
										<div key={field.id} className="border-b border-border pb-3 last:border-0">
											<p className="text-sm font-medium text-muted-foreground mb-1">{field.label}</p>
											<p className="text-base break-words">{formatValue(value, field)}</p>
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* 画像 */}
					{reportId && images.length > 0 && (
						<div>
							<ImagePreview
								images={images}
								reportId={reportId}
								onDeleteSuccess={(imageId) => {
									onImageDelete?.(imageId)
								}}
							/>
						</div>
					)}

					{/* データがない場合 */}
					{!template && !title && fields.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">テンプレートを選択して入力してください</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
