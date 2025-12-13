import { redirect } from "next/navigation"
import { UserForm } from "@/features/user/components/user-form"
import { getServerSession } from "@/lib/auth-utils"

export default async function NewUserPage() {
	const session = await getServerSession()

	if (!session?.user) {
		redirect("/login")
	}

	if (session.user.role !== "admin") {
		redirect("/dashboard")
	}

	return (
		<div className="container py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">ユーザー作成</h1>
				<p className="text-sm text-muted-foreground">新しいユーザーを作成します。</p>
			</div>

			<UserForm redirectTo="/admin/users" />
		</div>
	)
}
