"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import type { Template, TemplateField } from "@/types/template"
import { ImageUploader } from "./image-uploader"

interface ReportFormProps {
	templates: Template[]
}

type FormStep = "template" | "fields" | "images" | "preview"

interface FormData {
	templateId: string
	title: string
	fieldValues: Record<string, unknown>
}

function createFieldSchema(fields: TemplateField[]) {
	const schema: Record<string, z.ZodTypeAny> = {
		templateId: z.string().min(1, "テンプレートを選択してください"),
		title: z.string().min(1, "タイトルは必須です"),
	}

	for (const field of fields) {
		if (field.required) {
			switch (field.inputType) {
				case "text":
				case "textarea":
					schema[field.key] = z.string().min(1, `${field.label}は必須です`)
					break
				case "number":
					schema[field.key] = z.number({ required_error: `${field.label}は必須です` })
					break
				case "date":
					schema[field.key] = z.string().min(1, `${field.label}は必須です`)
					break
				case "checkbox":
					schema[field.key] = z.boolean()
					break
				case "select":
					schema[field.key] = z.string().min(1, `${field.label}は必須です`)
					break
				default:
					schema[field.key] = z.string().min(1, `${field.label}は必須です`)
			}
		} else {
			switch (field.inputType) {
				case "number":
					schema[field.key] = z.number().optional()
					break
				case "checkbox":
					schema[field.key] = z.boolean().optional()
					break
				default:
					schema[field.key] = z.string().optional()
			}
		}
	}

	return z.object(schema)
}

export function ReportForm({ templates }: ReportFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [step, setStep] = useState<FormStep>("template")
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
	const [reportId, setReportId] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()

	const publishedTemplates = templates.filter((t) => t.currentVersion?.status === "published")

	const defaultValues: FormData = {
		templateId: "",
		title: "",
		fieldValues: {},
	}

	const fields = selectedTemplate?.currentVersion?.fields ?? []
	const schema = fields.length > 0 ? createFieldSchema(fields) : z.object({ templateId: z.string(), title: z.string() })

	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues,
		mode: "onChange",
	})

	const { register, handleSubmit, formState, watch, setValue, trigger } = form
	const { errors, isValid } = formState

	const watchedValues = watch()

	// テンプレート選択時にフィールドのデフォルト値を設定
	useEffect(() => {
		if (selectedTemplate?.currentVersion?.fields) {
			const initialFieldValues: Record<string, unknown> = {}
			for (const field of selectedTemplate.currentVersion.fields) {
				if (field.inputType === "checkbox") {
					initialFieldValues[field.key] = false
				} else if (field.inputType === "number") {
					initialFieldValues[field.key] = undefined
				} else {
					initialFieldValues[field.key] = ""
				}
			}
			setValue("fieldValues", initialFieldValues)
		}
	}, [selectedTemplate, setValue])

	const handleTemplateSelect = (templateId: string) => {
		const template = templates.find((t) => t.id === templateId)
		if (template) {
			setSelectedTemplate(template)
			setValue("templateId", templateId)
			setValue("fieldValues", {})
		}
	}

	const handleNext = async () => {
		if (step === "template") {
			if (!watchedValues.templateId) {
				toast({
					title: "エラー",
					description: "テンプレートを選択してください",
					variant: "destructive",
				})
				return
			}
			if (!watchedValues.title?.trim()) {
				toast({
					title: "エラー",
					description: "タイトルを入力してください",
					variant: "destructive",
				})
				return
			}
			setStep("fields")
		} else if (step === "fields") {
			const isValidFields = await trigger()
			if (!isValidFields) {
				toast({
					title: "エラー",
					description: "必須項目を入力してください",
					variant: "destructive",
				})
				return
			}
			// フィールド入力後、下書き保存してから画像アップロードに進む
			const data = form.getValues()
			await handleSaveDraftSilently(data)
			setStep("images")
		} else if (step === "images") {
			setStep("preview")
		}
	}

	const handleSaveDraftSilently = async (data: FormData) => {
		if (reportId) {
			// 既に報告書が作成されている場合は更新
			try {
				const response = await fetch(`/api/reports/${reportId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: data.title,
						fieldValues: data.fieldValues,
						status: "draft",
					}),
				})

				if (!response.ok) {
					throw new Error("下書き保存に失敗しました")
				}
			} catch (error) {
				console.error("下書き保存エラー:", error)
			}
		} else {
			// 新しい報告書を作成
			try {
				const response = await fetch("/api/reports", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						templateId: data.templateId,
						title: data.title,
						fieldValues: data.fieldValues,
						status: "draft",
					}),
				})

				if (!response.ok) {
					throw new Error("下書き保存に失敗しました")
				}

				const result = await response.json()
				setReportId(result.report.id)
			} catch (error) {
				console.error("下書き保存エラー:", error)
			}
		}
	}

	const handleBack = () => {
		if (step === "fields") {
			setStep("template")
		} else if (step === "images") {
			setStep("fields")
		} else if (step === "preview") {
			setStep("images")
		}
	}

	const handleSaveDraft = async (data: FormData) => {
		startTransition(async () => {
			try {
				if (reportId) {
					// 既存の報告書を更新
					const response = await fetch(`/api/reports/${reportId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							title: data.title,
							fieldValues: data.fieldValues,
							status: "draft",
						}),
					})

					if (!response.ok) {
						const error = await response.json()
						throw new Error(error.error || "下書き保存に失敗しました")
					}

					toast({
						title: "下書き保存しました",
						description: "報告書を下書きとして保存しました",
					})
				} else {
					// 新しい報告書を作成
					const response = await fetch("/api/reports", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							templateId: data.templateId,
							title: data.title,
							fieldValues: data.fieldValues,
							status: "draft",
						}),
					})

					if (!response.ok) {
						const error = await response.json()
						throw new Error(error.error || "下書き保存に失敗しました")
					}

					const result = await response.json()
					setReportId(result.report.id)

					toast({
						title: "下書き保存しました",
						description: "報告書を下書きとして保存しました",
					})
				}
			} catch (error) {
				console.error("下書き保存エラー:", error)
				toast({
					title: "エラー",
					description: error instanceof Error ? error.message : "下書き保存に失敗しました",
					variant: "destructive",
				})
			}
		})
	}

	const handleSubmitReport = async (data: FormData) => {
		startTransition(async () => {
			try {
				if (reportId) {
					// 既存の報告書を更新して提出
					const response = await fetch(`/api/reports/${reportId}`, {
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							title: data.title,
							fieldValues: data.fieldValues,
							status: "submitted",
						}),
					})

					if (!response.ok) {
						const error = await response.json()
						throw new Error(error.error || "報告書の提出に失敗しました")
					}

					await response.json()
					toast({
						title: "報告書を提出しました",
						description: "報告書が正常に提出されました",
					})

					router.push("/dashboard")
				} else {
					// 新しい報告書を作成して提出
					const response = await fetch("/api/reports", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							templateId: data.templateId,
							title: data.title,
							fieldValues: data.fieldValues,
							status: "submitted",
						}),
					})

					if (!response.ok) {
						const error = await response.json()
						throw new Error(error.error || "報告書の提出に失敗しました")
					}

					await response.json()
					toast({
						title: "報告書を提出しました",
						description: "報告書が正常に提出されました",
					})

					router.push("/dashboard")
				}
			} catch (error) {
				console.error("報告書提出エラー:", error)
				toast({
					title: "エラー",
					description: error instanceof Error ? error.message : "報告書の提出に失敗しました",
					variant: "destructive",
				})
			}
		})
	}

	const renderFieldInput = (field: TemplateField) => {
		const error = errors.fieldValues?.[field.key]
		const config = field.config as {
			options?: string[]
			unit?: string
			placeholder?: string
			maxLength?: number
			min?: number
			max?: number
			step?: number
		} | null

		switch (field.inputType) {
			case "text":
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<Input
							{...register(`fieldValues.${field.key}` as const)}
							placeholder={config?.placeholder}
							maxLength={config?.maxLength}
							aria-invalid={error ? "true" : "false"}
						/>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
						{config?.unit && <FieldDescription>単位: {config.unit}</FieldDescription>}
					</Field>
				)

			case "textarea":
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<textarea
							{...register(`fieldValues.${field.key}` as const)}
							placeholder={config?.placeholder}
							maxLength={config?.maxLength}
							rows={4}
							className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							aria-invalid={error ? "true" : "false"}
						/>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)

			case "number":
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<div className="flex items-center gap-2">
							<Input
								type="number"
								{...register(`fieldValues.${field.key}` as const, {
									valueAsNumber: true,
								})}
								placeholder={config?.placeholder}
								min={config?.min}
								max={config?.max}
								step={config?.step}
								aria-invalid={error ? "true" : "false"}
							/>
							{config?.unit && <span className="text-sm text-muted-foreground">{config.unit}</span>}
						</div>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)

			case "date":
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<Input
							type="date"
							{...register(`fieldValues.${field.key}` as const)}
							aria-invalid={error ? "true" : "false"}
						/>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)

			case "select":
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<Select
							value={(watchedValues.fieldValues?.[field.key] as string) ?? ""}
							onValueChange={(value) => setValue(`fieldValues.${field.key}` as const, value)}
						>
							<SelectTrigger aria-invalid={error ? "true" : "false"}>
								<SelectValue placeholder="選択してください" />
							</SelectTrigger>
							<SelectContent>
								{config?.options?.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)

			case "checkbox":
				return (
					<Field key={field.id}>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								{...register(`fieldValues.${field.key}` as const)}
								className="h-4 w-4 rounded border-input"
								aria-invalid={error ? "true" : "false"}
							/>
							<FieldLabel>
								{field.label}
								{field.required && <span className="text-destructive ml-1">*</span>}
							</FieldLabel>
						</div>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)

			default:
				return (
					<Field key={field.id}>
						<FieldLabel>
							{field.label}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</FieldLabel>
						<Input
							{...register(`fieldValues.${field.key}` as const)}
							placeholder={config?.placeholder}
							aria-invalid={error ? "true" : "false"}
						/>
						{error && <p className="text-sm text-destructive">{error.message as string}</p>}
					</Field>
				)
		}
	}

	return (
		<form onSubmit={handleSubmit(handleSubmitReport)} className="space-y-6">
			{/* ステップ1: テンプレート選択 */}
			{step === "template" && (
				<Card>
					<CardHeader>
						<CardTitle>ステップ 1: テンプレート選択</CardTitle>
						<CardDescription>報告書に使用するテンプレートを選択してください</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Field>
							<FieldLabel>
								テンプレート <span className="text-destructive">*</span>
							</FieldLabel>
							<Select value={watchedValues.templateId} onValueChange={handleTemplateSelect}>
								<SelectTrigger>
									<SelectValue placeholder="テンプレートを選択してください" />
								</SelectTrigger>
								<SelectContent>
									{publishedTemplates.map((template) => (
										<SelectItem key={template.id} value={template.id}>
											{template.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.templateId && <p className="text-sm text-destructive">{errors.templateId.message}</p>}
							{selectedTemplate?.description && <FieldDescription>{selectedTemplate.description}</FieldDescription>}
						</Field>

						<Field>
							<FieldLabel>
								タイトル <span className="text-destructive">*</span>
							</FieldLabel>
							<Input {...register("title")} placeholder="報告書のタイトルを入力してください" />
							{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
						</Field>
					</CardContent>
				</Card>
			)}

			{/* ステップ2: フィールド入力 */}
			{step === "fields" && selectedTemplate && (
				<Card>
					<CardHeader>
						<CardTitle>ステップ 2: 情報入力</CardTitle>
						<CardDescription>{selectedTemplate.name}の情報を入力してください</CardDescription>
					</CardHeader>
					<CardContent>
						<FieldGroup>{fields.map((field) => renderFieldInput(field))}</FieldGroup>
					</CardContent>
				</Card>
			)}

			{/* ステップ3: 画像アップロード */}
			{step === "images" && (
				<Card>
					<CardHeader>
						<CardTitle>ステップ 3: 画像アップロード</CardTitle>
						<CardDescription>報告書に添付する画像をアップロードしてください（任意）</CardDescription>
					</CardHeader>
					<CardContent>
						{reportId ? (
							<ImageUploader
								reportId={reportId}
								onUploadSuccess={() => {
									// 画像アップロード成功時の処理
								}}
							/>
						) : (
							<p className="text-sm text-muted-foreground">報告書を保存中...</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* ステップ4: プレビュー */}
			{step === "preview" && selectedTemplate && (
				<Card>
					<CardHeader>
						<CardTitle>ステップ 4: 確認</CardTitle>
						<CardDescription>入力内容を確認してください</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<h3 className="font-semibold mb-2">タイトル</h3>
							<p>{watchedValues.title}</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">テンプレート</h3>
							<p>{selectedTemplate.name}</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">入力内容</h3>
							<div className="space-y-2">
								{fields.map((field) => {
									const value = watchedValues.fieldValues?.[field.key]
									return (
										<div key={field.id} className="border-b pb-2">
											<p className="text-sm font-medium text-muted-foreground">{field.label}</p>
											<p className="mt-1">
												{value === undefined || value === null || value === ""
													? "（未入力）"
													: typeof value === "boolean"
														? value
															? "はい"
															: "いいえ"
														: String(value)}
											</p>
										</div>
									)
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* ナビゲーションボタン */}
			<div className="flex items-center justify-between">
				<div>
					{step !== "template" && (
						<Button type="button" variant="outline" onClick={handleBack} disabled={isPending}>
							<ChevronLeft className="mr-2 h-4 w-4" />
							戻る
						</Button>
					)}
				</div>
				<div className="flex items-center gap-2">
					{step !== "preview" && (
						<>
							{step === "fields" && (
								<Button type="button" variant="outline" onClick={handleSubmit(handleSaveDraft)} disabled={isPending}>
									{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
									下書き保存
								</Button>
							)}
							<Button type="button" onClick={handleNext} disabled={isPending}>
								次へ
								<ChevronRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					)}
					{step === "preview" && (
						<>
							<Button type="button" variant="outline" onClick={handleSubmit(handleSaveDraft)} disabled={isPending}>
								{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								下書き保存
							</Button>
							<Button type="submit" disabled={isPending || !isValid}>
								{isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
								報告書を提出
							</Button>
						</>
					)}
				</div>
			</div>
		</form>
	)
}
