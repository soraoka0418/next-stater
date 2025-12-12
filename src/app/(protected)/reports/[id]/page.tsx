import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PDFDownloadButton } from "@/features/report/components/pdf-download-button"
import { PDFPreview } from "@/features/report/components/pdf-preview"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

interface ReportDetailPageProps {
	params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
	const { id: reportId } = await params
	const session = await getServerSession()

	if (!session?.user?.id) {
		redirect("/login")
	}

	// 報告書データを取得
	// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはprisma.reportは存在する
	const report = await prisma.report.findUnique({
		where: { id: reportId },
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
		redirect("/dashboard")
	}

	// 作成者のみアクセス可能
	if (report.authorId !== session.user.id) {
		redirect("/dashboard")
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>報告書詳細: {report.title}</CardTitle>
							<CardDescription>
								作成日: {new Date(report.createdAt).toLocaleDateString("ja-JP")} | ステータス: {report.status}
							</CardDescription>
						</div>
						<PDFDownloadButton reportId={reportId} />
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground mb-1">テンプレート</p>
							<p>{report.template.name}</p>
						</div>
						{report.template.description && (
							<div>
								<p className="text-sm font-medium text-muted-foreground mb-1">説明</p>
								<p className="text-sm">{report.template.description}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* PDFプレビュー */}
			<PDFPreview reportId={reportId} title={report.title} />
		</div>
	)
}
