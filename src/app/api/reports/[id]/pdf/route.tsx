import { renderToBuffer } from "@react-pdf/renderer"
import { type NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "@/features/report/lib/pdf-generator"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		// 報告書データを取得
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
				templateVersion: {
					include: {
						fields: { orderBy: { order: "asc" } },
					},
				},
				fieldValues: {
					orderBy: { displayOrder: "asc" },
				},
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

		// フィールド値をRecord形式に変換
		const fieldValues: Record<string, unknown> = {}
		for (const fieldValue of report.fieldValues) {
			fieldValues[fieldValue.fieldKey] = fieldValue.value
		}

		// テンプレートバージョンとフィールドを取得
		const templateVersion = report.templateVersion || report.template.currentVersion
		if (!templateVersion) {
			return NextResponse.json({ error: "テンプレートバージョンが見つかりません" }, { status: 404 })
		}

		// PDFドキュメントを生成
		let pdfDocument: React.ReactElement
		try {
			pdfDocument = (
				<PDFDocument
					title={report.title}
					templateName={report.template.name}
					templateContent={templateVersion.content}
					fields={templateVersion.fields}
					fieldValues={fieldValues}
					images={report.images}
				/>
			)
		} catch (error) {
			console.error("PDFドキュメント生成エラー:", error)
			return NextResponse.json({ error: "PDFドキュメントの生成に失敗しました" }, { status: 500 })
		}

		// PDFをバッファにレンダリング
		let pdfBuffer: Buffer
		try {
			pdfBuffer = await renderToBuffer(pdfDocument)
		} catch (error) {
			console.error("PDFレンダリングエラー:", error)
			return NextResponse.json({ error: "PDFのレンダリングに失敗しました" }, { status: 500 })
		}

		// PDFファイル名を生成（タイトルから安全なファイル名を作成）
		const safeTitle = report.title.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, "_")
		const fileName = `${safeTitle || "report"}_${id.slice(0, 8)}.pdf`

		// PDFを返却
		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
			},
		})
	} catch (error) {
		console.error("PDF生成エラー:", error)
		return NextResponse.json({ error: "PDFの生成に失敗しました" }, { status: 500 })
	}
}
