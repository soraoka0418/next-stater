import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { getServerSession } from "@/lib/auth-utils"

export default async function ProfilePage() {
	const session = await getServerSession()

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">プロフィール</h1>
				<LogoutButton variant="outline" />
			</div>
			<Card>
				<CardHeader>
					<CardTitle>プロフィール情報</CardTitle>
					<CardDescription>アカウント情報を確認・編集できます</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-muted-foreground">名前</p>
							<p className="font-medium">{session?.user?.name || "未設定"}</p>
						</div>
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
