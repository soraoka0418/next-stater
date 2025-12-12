import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

interface CreateReportRequest {
	templateId: string
	title: string
	fieldValues: Record<string, unknown>
	status?: "draft" | "submitted"
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		const body = (await request.json()) as CreateReportRequest
		const { templateId, title, fieldValues, status = "draft" } = body

		if (!templateId || !title?.trim()) {
			return NextResponse.json({ error: "テンプレートIDとタイトルは必須です" }, { status: 400 })
		}

		// テンプレートとその現在のバージョンを取得
		// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはprisma.templateは存在する
		const template = await prisma.template.findUnique({
			where: { id: templateId },
			include: {
				currentVersion: {
					include: {
						fields: { orderBy: { order: "asc" } },
					},
				},
			},
		})

		if (!template) {
			return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
		}

		if (!template.currentVersion) {
			return NextResponse.json({ error: "テンプレートに有効なバージョンがありません" }, { status: 400 })
		}

		if (template.currentVersion.status !== "published") {
			return NextResponse.json({ error: "公開されているテンプレートのみ使用できます" }, { status: 400 })
		}

		// 必須フィールドのバリデーション
		const requiredFields = template.currentVersion.fields.filter((field: { required: boolean }) => field.required)
		for (const field of requiredFields) {
			const value = fieldValues[field.key]
			if (value === undefined || value === null || value === "") {
				return NextResponse.json({ error: `必須フィールド "${field.label}" が入力されていません` }, { status: 400 })
			}
		}

		// 報告書を作成
		const report = await prisma.$transaction(async (tx) => {
			// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはtx.reportは存在する
			const newReport = await tx.report.create({
				data: {
					templateId: template.id,
					templateVersionId: template.currentVersion.id,
					title: title.trim(),
					status,
					authorId: session.user.id,
					submittedAt: status === "submitted" ? new Date() : null,
					fieldValues: {
						create: Object.entries(fieldValues).map(([key, value], index) => ({
							fieldKey: key,
							value: value as unknown,
							displayOrder: index,
						})),
					},
				},
				include: {
					template: {
						include: {
							currentVersion: {
								include: {
									fields: { orderBy: { order: "asc" } },
								},
							},
						},
					},
					fieldValues: true,
					images: true,
				},
			})

			return newReport
		})

		return NextResponse.json({ report }, { status: 201 })
	} catch (error) {
		console.error("報告書作成エラー:", error)
		return NextResponse.json({ error: "報告書の作成に失敗しました" }, { status: 500 })
	}
}
