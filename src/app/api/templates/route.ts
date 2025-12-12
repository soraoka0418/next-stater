import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { TemplateFieldInputType, TemplateStatus } from "@/types/template"

interface CreateTemplateRequest {
	name?: string
	description?: string | null
	status?: TemplateStatus
	content?: unknown
	fields?: Array<{
		key?: string
		label?: string
		inputType?: TemplateFieldInputType
		required?: boolean
		order?: number
		config?: Record<string, unknown> | null
	}>
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url)
	const search = searchParams.get("search")?.trim()
	const status = searchParams.get("status") as TemplateStatus | null
	const sort = searchParams.get("sort") === "asc" ? "asc" : "desc"

	try {
		const templates = await prisma.template.findMany({
			where: {
				AND: [
					search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" } },
									{ description: { contains: search, mode: "insensitive" } },
								],
							}
						: {},
					status ? { currentVersion: { status } } : {},
				],
			},
			include: {
				currentVersion: {
					include: {
						fields: { orderBy: { order: "asc" } },
					},
				},
			},
			orderBy: { createdAt: sort },
		})

		return NextResponse.json({ templates })
	} catch (error) {
		console.error("テンプレート一覧取得エラー:", error)
		return NextResponse.json({ error: "テンプレートの取得に失敗しました" }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	const session = await getServerSession()

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
	}

	const body = (await request.json()) as CreateTemplateRequest
	const name = body.name?.trim()
	const description = body.description?.trim() ?? null
	const status = body.status ?? "published"
	const content = body.content ?? {}
	const fields = body.fields ?? []

	if (!name) {
		return NextResponse.json({ error: "テンプレート名は必須です" }, { status: 400 })
	}

	try {
		const result = await prisma.$transaction(async (tx) => {
			const template = await tx.template.create({
				data: {
					name,
					description,
					createdById: session.user.id,
				},
			})

			const version = await tx.templateVersion.create({
				data: {
					templateId: template.id,
					version: 1,
					status,
					content,
					fields: {
						create: fields.map((field, index) => ({
							key: field.key ?? `field_${index + 1}`,
							label: field.label ?? `フィールド ${index + 1}`,
							inputType: field.inputType ?? "text",
							required: field.required ?? false,
							order: typeof field.order === "number" ? field.order : index,
							config: field.config ?? null,
						})),
					},
					publishedAt: status === "published" ? new Date() : null,
				},
				include: {
					fields: { orderBy: { order: "asc" } },
				},
			})

			await tx.template.update({
				where: { id: template.id },
				data: { currentVersionId: version.id },
			})

			return { ...template, currentVersion: version }
		})

		return NextResponse.json({ template: result }, { status: 201 })
	} catch (error) {
		console.error("テンプレート作成エラー:", error)
		return NextResponse.json({ error: "テンプレートの作成に失敗しました" }, { status: 500 })
	}
}
