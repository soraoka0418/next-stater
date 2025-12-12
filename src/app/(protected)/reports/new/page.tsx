import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportForm } from "@/features/report/components/report-form"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export default async function NewReportPage() {
	const session = await getServerSession()

	if (!session?.user?.id) {
		redirect("/login")
	}

	// 公開されているテンプレートを取得
	const templates = await prisma.template.findMany({
		where: {
			currentVersion: {
				status: "published",
			},
		},
		include: {
			currentVersion: {
				include: {
					fields: { orderBy: { order: "asc" } },
				},
			},
		},
		orderBy: { createdAt: "desc" },
	})

	return (
		<div className="container mx-auto py-8">
			<Card>
				<CardHeader>
					<CardTitle>新しい報告書を作成</CardTitle>
					<CardDescription>テンプレートを選択して報告書を作成します</CardDescription>
				</CardHeader>
				<CardContent>
					{templates.length === 0 ? (
						<p className="text-sm text-muted-foreground">利用可能なテンプレートがありません</p>
					) : (
						<ReportForm templates={templates} />
					)}
				</CardContent>
			</Card>
		</div>
	)
}
