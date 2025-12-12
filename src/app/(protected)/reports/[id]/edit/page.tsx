import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportImageManager } from "@/features/report/components/report-image-manager"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

interface ReportEditPageProps {
	params: Promise<{ id: string }>
}

export default async function ReportEditPage({ params }: ReportEditPageProps) {
	const { id: reportId } = await params
	const session = await getServerSession()

	if (!session?.user?.id) {
		redirect("/login")
	}

	// レポートの存在確認と権限チェック
	// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはprisma.reportは存在する（API Routeでも同様のコードが動作している）
	const report = await prisma.report.findUnique({
		where: { id: reportId },
		select: {
			id: true,
			title: true,
			authorId: true,
			images: {
				orderBy: { order: "asc" },
			},
		},
	})

	if (!report) {
		redirect("/dashboard")
	}

	// レポートの作成者のみ編集可能
	if (report.authorId !== session.user.id) {
		redirect("/dashboard")
	}

	return (
		<div className="container mx-auto py-8">
			<Card>
				<CardHeader>
					<CardTitle>レポート編集: {report.title}</CardTitle>
					<CardDescription>画像をアップロードまたは削除できます</CardDescription>
				</CardHeader>
				<CardContent>
					<ReportImageManager reportId={reportId} initialImages={report.images} />
				</CardContent>
			</Card>
		</div>
	)
}
