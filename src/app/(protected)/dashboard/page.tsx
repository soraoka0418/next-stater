import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getServerSession } from "@/lib/auth-utils"

export default async function DashboardPage() {
	const session = await getServerSession()

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">ダッシュボード</h1>
				<LogoutButton variant="outline" />
			</div>
			<Card>
				<CardHeader>
					<CardTitle>ようこそ、{session?.user?.name || session?.user?.email}さん</CardTitle>
					<CardDescription>ダッシュボードへようこそ</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">メールアドレス</p>
							<p className="font-medium">{session?.user?.email}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">ロール</p>
							<p className="font-medium">{session?.user?.role}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
