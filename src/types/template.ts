export type TemplateStatus = "draft" | "published" | "archived"

export type TemplateFieldInputType = "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "signature"

export interface TemplateFieldConfig {
	options?: string[]
	unit?: string
	placeholder?: string
	maxLength?: number
	min?: number
	max?: number
	step?: number
}

export interface TemplateField {
	id: string
	templateVersionId: string
	key: string
	label: string
	inputType: TemplateFieldInputType
	required: boolean
	order: number
	config?: TemplateFieldConfig | null
}

export interface TemplateVersion {
	id: string
	templateId: string
	version: number
	status: TemplateStatus
	content: unknown // Tiptap JSON
	fields: TemplateField[]
	publishedAt?: Date | null
	createdAt: Date
}

export interface Template {
	id: string
	name: string
	description?: string | null
	currentVersionId?: string | null
	currentVersion?: TemplateVersion | null
	createdById: string
	createdAt: Date
	updatedAt: Date
}
