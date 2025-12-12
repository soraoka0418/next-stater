"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Template } from "@/types/template"

interface TemplateCardProps {
	template: Template
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	isAdmin?: boolean
}

function formatDate(value?: Date) {
	if (!value) return ""
	return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(value)
}

export function TemplateCard({ template, onEdit, onDelete, isAdmin = false }: TemplateCardProps) {
	const version = template.currentVersion
	const status = version?.status ?? "draft"

	return (
		<Card>
			<CardHeader className="space-y-1">
				<div className="flex items-start justify-between gap-2">
					<div>
						<CardTitle className="text-lg">{template.name}</CardTitle>
						<CardDescription>{template.description}</CardDescription>
					</div>
					<div
						className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground"
						title={`ステータス: ${status}`}
					>
						{status}
					</div>
				</div>
				<div className="text-xs text-muted-foreground">
					<span>v{version?.version ?? "-"} / </span>
					<span>更新: {formatDate(template.updatedAt)}</span>
				</div>
			</CardHeader>
			<CardContent className="space-y-2 text-sm text-muted-foreground">
				<div>フィールド数: {version?.fields.length ?? 0}</div>
				{version?.publishedAt && <div>公開: {formatDate(version.publishedAt)}</div>}
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				<Link href={`/templates/${template.id}/preview`} className="text-sm font-medium text-primary hover:underline">
					プレビュー
				</Link>
				{isAdmin && (
					<div className="flex items-center gap-3 text-sm">
						<button
							type="button"
							onClick={() => onEdit?.(template.id)}
							className="text-primary hover:underline"
							aria-label="テンプレートを編集"
						>
							編集
						</button>
						<button
							type="button"
							onClick={() => onDelete?.(template.id)}
							className="text-destructive hover:underline"
							aria-label="テンプレートを削除"
						>
							削除
						</button>
					</div>
				)}
			</CardFooter>
		</Card>
	)
}
