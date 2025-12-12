"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"
import type { TemplateField, TemplateStatus } from "@/types/template"

interface TemplatePreviewProps {
	title: string
	description?: string | null
	status?: TemplateStatus
	content: unknown
	fields?: TemplateField[]
}

export function TemplatePreview({ title, description, status, content, fields = [] }: TemplatePreviewProps) {
	const editor = useEditor(
		{
			editable: false,
			extensions: [StarterKit],
			content: content ?? {},
		},
		[content],
	)

	useEffect(() => {
		if (!editor) return
		editor.commands.setContent(content ?? {})
	}, [content, editor])

	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase text-muted-foreground">{status}</p>
				<h2 className="text-2xl font-semibold">{title}</h2>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>

			<div className="rounded-md border bg-background">
				<EditorContent editor={editor} className="prose max-w-none px-4 py-3" />
			</div>

			{fields.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-lg font-semibold">フィールド</h3>
					<ul className="space-y-2">
						{fields.map((field) => (
							<li key={field.id} className="rounded-md border px-3 py-2">
								<p className="text-sm font-medium">{field.label}</p>
								<p className="text-xs text-muted-foreground">{field.inputType}</p>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
