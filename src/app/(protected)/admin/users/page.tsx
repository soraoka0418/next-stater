import { redirect } from "next/navigation"
import { UserList } from "@/features/user/components/user-list"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export default async function UsersPage() {
	const session = await getServerSession()

	if (!session?.user) {
		redirect("/login")
	}

	if (session.user.role !== "admin") {
		redirect("/dashboard")
	}

	// 初期データを取得（削除済みは含まない）
	const initialUsers = await prisma.user.findMany({
		where: {
			deletedAt: null,
		},
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			emailVerified: true,
			image: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true,
		},
		orderBy: { createdAt: "desc" },
	})

	return (
		<div className="container py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">ユーザー管理</h1>
				<p className="text-sm text-muted-foreground">ユーザーの検索、作成、編集、削除ができます。</p>
			</div>

			<UserList initialUsers={initialUsers} />
		</div>
	)
}
