"use client"

import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"
import { Toggle } from "@/components/ui/toggle"

interface TemplateEditorProps {
	value?: unknown
	onChange?: (value: unknown) => void
	placeholder?: string
	disabled?: boolean
}

export function TemplateEditor({ value, onChange, placeholder, disabled }: TemplateEditorProps) {
	const editor = useEditor(
		{
			editable: !disabled,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] },
					bulletList: { keepMarks: true, keepAttributes: false },
				}),
				Placeholder.configure({
					placeholder: placeholder ?? "テンプレート本文を入力",
				}),
			],
			content: value ?? "",
			onUpdate: ({ editor: e }) => onChange?.(e.getJSON()),
		},
		[value],
	)

	useEffect(() => {
		if (!editor || !value) return
		editor.commands.setContent(value)
	}, [editor, value])

	if (!editor) return null

	return (
		<div className="space-y-3">
			<EditorToolbar editor={editor} />
			<div className="rounded-md border bg-background">
				<EditorContent editor={editor} className="prose prose-sm max-w-none px-3 py-2 focus:outline-none" />
			</div>
		</div>
	)
}

interface EditorToolbarProps {
	editor: ReturnType<typeof useEditor>
}

function EditorToolbar({ editor }: EditorToolbarProps) {
	return (
		<div className="flex flex-wrap gap-2 rounded-md border bg-muted/50 p-2">
			<Toggle
				size="sm"
				pressed={editor.isActive("bold")}
				onPressedChange={() => editor.chain().focus().toggleBold().run()}
				aria-label="太字"
			>
				太字
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("italic")}
				onPressedChange={() => editor.chain().focus().toggleItalic().run()}
				aria-label="斜体"
			>
				斜体
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("heading", { level: 2 })}
				onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				aria-label="見出し"
			>
				H2
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("bulletList")}
				onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
				aria-label="箇条書き"
			>
				箇条書き
			</Toggle>
			<Toggle
				size="sm"
				pressed={editor.isActive("orderedList")}
				onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
				aria-label="番号付きリスト"
			>
				番号
			</Toggle>
		</div>
	)
}
