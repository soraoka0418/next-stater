"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import type { Template, TemplateField, TemplateStatus } from "@/types/template"
import { FieldEditor } from "./field-editor"
import { TemplateEditor } from "./template-editor"

interface TemplateFormProps {
	initialTemplate?: Template
	onSuccess?: (templateId: string) => void
	redirectTo?: (templateId: string) => string
}

interface TemplateFormValues {
	name: string
	description: string
	status: TemplateStatus
	content: unknown
	fields: Omit<TemplateField, "templateVersionId">[]
}

export function TemplateForm({ initialTemplate, onSuccess, redirectTo }: TemplateFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [submitting, setSubmitting] = useState(false)

	const form = useForm<TemplateFormValues>({
		defaultValues: {
			name: initialTemplate?.name ?? "",
			description: initialTemplate?.description ?? "",
			status: initialTemplate?.currentVersion?.status ?? "draft",
			content: initialTemplate?.currentVersion?.content ?? {},
			fields: initialTemplate?.currentVersion?.fields ?? [],
		},
	})

	const handleSubmit = form.handleSubmit(async (values) => {
		setSubmitting(true)
		const payload = {
			name: values.name,
			description: values.description,
			status: values.status,
			content: values.content,
			fields: values.fields.map((field, index) => ({
				...field,
				order: field.order ?? index,
			})),
		}

		try {
			const url = initialTemplate ? `/api/templates/${initialTemplate.id}` : "/api/templates"
			const method = initialTemplate ? "PUT" : "POST"

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const error = await response.json().catch(() => ({}))
				throw new Error(error.error ?? "保存に失敗しました")
			}

			const data = await response.json()
			const templateId = initialTemplate?.id ?? data.template?.id ?? data.version?.templateId

			toast({ title: "保存しました" })
			if (templateId && redirectTo) {
				router.push(redirectTo(templateId))
				return
			}

			router.refresh()
			if (templateId) onSuccess?.(templateId)
		} catch (error) {
			const message = error instanceof Error ? error.message : "保存に失敗しました"
			toast({ title: "エラーが発生しました", description: message, variant: "destructive" })
		} finally {
			setSubmitting(false)
		}
	})

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{initialTemplate ? "テンプレートを編集" : "テンプレートを作成"}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">テンプレート名</Label>
						<Input id="name" placeholder="報告書テンプレート" {...form.register("name", { required: true })} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">説明</Label>
						<Input id="description" placeholder="概要や利用シーン" {...form.register("description")} />
					</div>
					<div className="space-y-2">
						<Label>ステータス</Label>
						<Select
							value={form.watch("status")}
							onValueChange={(value) => form.setValue("status", value as TemplateStatus, { shouldDirty: true })}
						>
							<SelectTrigger>
								<SelectValue placeholder="下書き" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">下書き</SelectItem>
								<SelectItem value="published">公開</SelectItem>
								<SelectItem value="archived">アーカイブ</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label>本文</Label>
						<TemplateEditor
							value={form.watch("content")}
							onChange={(value) => form.setValue("content", value, { shouldDirty: true })}
							placeholder="本文を入力してください"
						/>
					</div>
					<div className="space-y-2">
						<FieldEditor
							value={form.watch("fields")}
							onChange={(fields) => form.setValue("fields", fields, { shouldDirty: true })}
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end">
					<Button type="submit" disabled={submitting}>
						{submitting ? "保存中..." : "保存する"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	)
}
