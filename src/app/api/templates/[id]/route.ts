import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { TemplateFieldInputType, TemplateStatus } from "@/types/template"

interface UpdateTemplateRequest {
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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	try {
		const template = await prisma.template.findUnique({
			where: { id },
			include: {
				currentVersion: {
					include: { fields: { orderBy: { order: "asc" } } },
				},
				versions: {
					select: { id: true, version: true, status: true, createdAt: true, publishedAt: true },
					orderBy: { version: "desc" },
				},
			},
		})

		if (!template) {
			return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
		}

		return NextResponse.json({ template })
	} catch (error) {
		console.error("テンプレート取得エラー:", error)
		return NextResponse.json({ error: "テンプレートの取得に失敗しました" }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await getServerSession()
	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
	}

	const { id } = await params
	const body = (await request.json()) as UpdateTemplateRequest
	const name = body.name?.trim()
	const description = body.description?.trim() ?? null
	const status = body.status ?? "published"
	const content = body.content ?? {}
	const fields = body.fields ?? []

	try {
		const result = await prisma.$transaction(async (tx) => {
			const existing = await tx.template.findUnique({
				where: { id },
				select: {
					name: true,
					description: true,
					versions: {
						select: { version: true },
						orderBy: { version: "desc" },
						take: 1,
					},
				},
			})

			if (!existing) {
				throw new Error("NOT_FOUND")
			}

			const nextVersion = (existing.versions.at(0)?.version ?? 0) + 1

			if (name || body.description !== undefined) {
				await tx.template.update({
					where: { id },
					data: {
						name: name ?? existing.name,
						description: body.description !== undefined ? description : existing.description,
					},
				})
			}

			const version = await tx.templateVersion.create({
				data: {
					templateId: id,
					version: nextVersion,
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
				include: { fields: { orderBy: { order: "asc" } } },
			})

			await tx.template.update({
				where: { id },
				data: { currentVersionId: version.id },
			})

			return version
		})

		return NextResponse.json({ version: result })
	} catch (error) {
		if (error instanceof Error && error.message === "NOT_FOUND") {
			return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
		}
		console.error("テンプレート更新エラー:", error)
		return NextResponse.json({ error: "テンプレートの更新に失敗しました" }, { status: 500 })
	}
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const session = await getServerSession()
	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
	}

	const { id } = await params

	try {
		await prisma.template.delete({ where: { id } })
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("テンプレート削除エラー:", error)
		return NextResponse.json({ error: "テンプレートの削除に失敗しました" }, { status: 500 })
	}
}
