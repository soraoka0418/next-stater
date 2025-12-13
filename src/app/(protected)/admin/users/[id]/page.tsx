import { redirect } from "next/navigation"
import { UserForm } from "@/features/user/components/user-form"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { User } from "@/types/user"

interface UserEditPageProps {
	params: Promise<{ id: string }>
}

export default async function UserEditPage({ params }: UserEditPageProps) {
	const session = await getServerSession()

	if (!session?.user) {
		redirect("/login")
	}

	if (session.user.role !== "admin") {
		redirect("/dashboard")
	}

	const { id } = await params

	// Prismaクライアントの型定義が正しく更新されていない場合に備えて、
	// selectを使わずに全フィールドを取得してから型アサーションを使用
	const userData = await prisma.user.findUnique({
		where: { id },
	})

	if (!userData) {
		redirect("/admin/users")
	}

	// 型アサーションを使用してUser型に変換
	// Prismaの型定義にはdeletedAtとpasswordHashが含まれているが、
	// TypeScriptの型解決が正しく動作しない場合があるため型アサーションを使用
	const user = userData as unknown as User

	return (
		<div className="container py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">ユーザー編集</h1>
				<p className="text-sm text-muted-foreground">ユーザー情報を編集します。</p>
			</div>

			<UserForm initialUser={user} redirectTo="/admin/users" />
		</div>
	)
}
