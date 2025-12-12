"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import type { Template } from "@/types/template"
import { TemplateCard } from "./template-card"

interface TemplateListProps {
	templates: Template[]
	isAdmin?: boolean
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
	emptyMessage?: string
}

export function TemplateList({
	templates,
	isAdmin = false,
	onEdit,
	onDelete,
	emptyMessage = "テンプレートがありません",
}: TemplateListProps) {
	const router = useRouter()
	const [pending, startTransition] = useTransition()

	const handleEdit = (id: string) => {
		if (onEdit) return onEdit(id)
		router.push(`/templates/${id}/edit`)
	}

	const handleDelete = async (id: string) => {
		if (onDelete) return onDelete(id)
		if (!confirm("テンプレートを削除しますか？")) return
		startTransition(async () => {
			await fetch(`/api/templates/${id}`, { method: "DELETE" })
			router.refresh()
		})
	}

	if (templates.length === 0) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy={pending}>
			{templates.map((template) => (
				<TemplateCard
					key={template.id}
					template={template}
					isAdmin={isAdmin}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			))}
		</div>
	)
}
