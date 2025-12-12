"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TemplateField, TemplateFieldInputType } from "@/types/template"

type EditableField = Omit<TemplateField, "id" | "templateVersionId"> & { id?: string }

interface FieldEditorProps {
	value?: EditableField[]
	onChange?: (fields: EditableField[]) => void
}

const INPUT_TYPES: TemplateFieldInputType[] = ["text", "textarea", "number", "date", "select", "checkbox", "signature"]

export function FieldEditor({ value = [], onChange }: FieldEditorProps) {
	const [fields, setFields] = useState<EditableField[]>(() => value)

	useEffect(() => setFields(value), [value])

	useEffect(() => onChange?.(fields), [fields, onChange])

	const handleAdd = () => {
		const next = [
			...fields,
			{
				id: crypto.randomUUID(),
				key: `field_${fields.length + 1}`,
				label: `フィールド ${fields.length + 1}`,
				inputType: "text",
				required: false,
				order: fields.length,
				config: {},
			},
		]
		setFields(next)
	}

	const handleUpdate = (index: number, patch: Partial<EditableField>) => {
		setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)))
	}

	const handleDelete = (index: number) => {
		setFields((prev) => prev.filter((_, i) => i !== index).map((field, i) => ({ ...field, order: i })))
	}

	const handleMove = (index: number, direction: -1 | 1) => {
		setFields((prev) => {
			const next = [...prev]
			const targetIndex = index + direction
			if (targetIndex < 0 || targetIndex >= next.length) return prev
			const [item] = next.splice(index, 1)
			next.splice(targetIndex, 0, item)
			return next.map((field, i) => ({ ...field, order: i }))
		})
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">動的フィールド</h3>
				<Button type="button" onClick={handleAdd} variant="outline" size="sm">
					フィールドを追加
				</Button>
			</div>

			<div className="space-y-4">
				{fields.map((field, index) => (
					<div key={field.id ?? index} className="rounded-md border p-4 space-y-3">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium">
								#{index + 1} {field.label}
							</p>
							<div className="flex items-center gap-2">
								<Button type="button" variant="ghost" size="sm" onClick={() => handleMove(index, -1)}>
									↑
								</Button>
								<Button type="button" variant="ghost" size="sm" onClick={() => handleMove(index, 1)}>
									↓
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleDelete(index)}
									className="text-destructive"
								>
									削除
								</Button>
							</div>
						</div>

						<div className="grid gap-3 md:grid-cols-2">
							<div className="space-y-2">
								<Label>キー</Label>
								<Input
									value={field.key}
									onChange={(event) => handleUpdate(index, { key: event.target.value })}
									placeholder="例: date"
								/>
							</div>
							<div className="space-y-2">
								<Label>ラベル</Label>
								<Input
									value={field.label}
									onChange={(event) => handleUpdate(index, { label: event.target.value })}
									placeholder="例: 日付"
								/>
							</div>
						</div>

						<div className="grid gap-3 md:grid-cols-3">
							<div className="space-y-2">
								<Label>タイプ</Label>
								<Select
									value={field.inputType}
									onValueChange={(value) => handleUpdate(index, { inputType: value as TemplateFieldInputType })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{INPUT_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>必須</Label>
								<Button
									type="button"
									variant={field.required ? "default" : "outline"}
									onClick={() => handleUpdate(index, { required: !field.required })}
									size="sm"
								>
									{field.required ? "必須" : "任意"}
								</Button>
							</div>
							<div className="space-y-2">
								<Label>順序</Label>
								<Input
									type="number"
									value={field.order}
									onChange={(event) => handleUpdate(index, { order: Number(event.target.value) })}
									min={0}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
