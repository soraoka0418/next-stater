import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

interface UpdateReportRequest {
	title?: string
	fieldValues?: Record<string, unknown>
	status?: "draft" | "submitted"
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはprisma.reportは存在する
		const report = await prisma.report.findUnique({
			where: { id },
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
				images: {
					orderBy: { order: "asc" },
				},
				author: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		})

		if (!report) {
			return NextResponse.json({ error: "報告書が見つかりません" }, { status: 404 })
		}

		// 作成者のみアクセス可能
		if (report.authorId !== session.user.id) {
			return NextResponse.json({ error: "この報告書にアクセスする権限がありません" }, { status: 403 })
		}

		return NextResponse.json({ report })
	} catch (error) {
		console.error("報告書取得エラー:", error)
		return NextResponse.json({ error: "報告書の取得に失敗しました" }, { status: 500 })
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		const body = (await request.json()) as UpdateReportRequest
		const { title, fieldValues, status } = body

		// 報告書の存在確認と権限チェック
		// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはprisma.reportは存在する
		const existingReport = await prisma.report.findUnique({
			where: { id },
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
			},
		})

		if (!existingReport) {
			return NextResponse.json({ error: "報告書が見つかりません" }, { status: 404 })
		}

		if (existingReport.authorId !== session.user.id) {
			return NextResponse.json({ error: "この報告書を編集する権限がありません" }, { status: 403 })
		}

		// 提出済みの報告書は編集不可
		if (existingReport.status === "submitted" || existingReport.status === "approved") {
			return NextResponse.json({ error: "提出済みの報告書は編集できません" }, { status: 400 })
		}

		// フィールド値のバリデーション
		if (fieldValues && existingReport.template.currentVersion) {
			const requiredFields = existingReport.template.currentVersion.fields.filter(
				(field: { required: boolean }) => field.required,
			)
			for (const field of requiredFields) {
				const value = fieldValues[field.key]
				if (value === undefined || value === null || value === "") {
					return NextResponse.json({ error: `必須フィールド "${field.label}" が入力されていません` }, { status: 400 })
				}
			}
		}

		// 報告書を更新
		const report = await prisma.$transaction(async (tx) => {
			// 既存のフィールド値を削除
			if (fieldValues) {
				// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはtx.reportFieldValueは存在する
				await tx.reportFieldValue.deleteMany({
					where: { reportId: id },
				})
			}

			// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはtx.reportは存在する
			const updatedReport = await tx.report.update({
				where: { id },
				data: {
					...(title && { title: title.trim() }),
					...(status && {
						status,
						submittedAt: status === "submitted" ? new Date() : existingReport.submittedAt,
					}),
					...(fieldValues && {
						fieldValues: {
							create: Object.entries(fieldValues).map(([key, value], index) => ({
								fieldKey: key,
								value: value as unknown,
								displayOrder: index,
							})),
						},
					}),
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
					images: {
						orderBy: { order: "asc" },
					},
				},
			})

			return updatedReport
		})

		return NextResponse.json({ report })
	} catch (error) {
		console.error("報告書更新エラー:", error)
		return NextResponse.json({ error: "報告書の更新に失敗しました" }, { status: 500 })
	}
}
