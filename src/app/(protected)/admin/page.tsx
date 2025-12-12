import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getServerSession } from "@/lib/auth-utils"

export default async function AdminPage() {
	const session = await getServerSession()

	if (!session || session.user.role !== "admin") {
		redirect("/dashboard")
	}

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">管理者ページ</h1>
				<LogoutButton variant="outline" />
			</div>
			<Card>
				<CardHeader>
					<CardTitle>管理者ダッシュボード</CardTitle>
					<CardDescription>管理者専用の機能にアクセスできます</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">管理者としてログイン中</p>
							<p className="font-medium">{session.user.email}</p>
						</div>
						<p className="text-sm text-muted-foreground">ここに管理者専用の機能を追加できます</p>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
