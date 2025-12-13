import { hash } from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { UpdateUserRequest } from "@/types/user"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
		}

		const user = await prisma.user.findUnique({
			where: { id },
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
		})

		if (!user) {
			return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
		}

		return NextResponse.json({ user })
	} catch (error) {
		console.error("ユーザー取得エラー:", error)
		return NextResponse.json({ error: "ユーザーの取得に失敗しました" }, { status: 500 })
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
		}

		const body = (await request.json()) as UpdateUserRequest
		const { email, name, role, password } = body

		// ユーザーの存在確認
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
		}

		// メールアドレスの重複チェック（変更する場合）
		if (email && email.trim() !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: { email: email.trim() },
			})

			if (emailExists) {
				return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 })
			}
		}

		// パスワードのハッシュ化（パスワードが提供されている場合）
		let passwordHash: string | undefined
		if (password?.trim()) {
			passwordHash = await hash(password.trim(), 10)
		}

		// ユーザーを更新
		const updateData: {
			email?: string
			name?: string | null
			role?: string
			passwordHash?: string | null
		} = {}

		if (email !== undefined) {
			updateData.email = email.trim()
		}
		if (name !== undefined) {
			updateData.name = name?.trim() || null
		}
		if (role !== undefined) {
			updateData.role = role
		}
		if (password !== undefined) {
			updateData.passwordHash = passwordHash || null
		}

		const user = await prisma.user.update({
			where: { id },
			data: updateData,
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
		})

		return NextResponse.json({ user })
	} catch (error) {
		console.error("ユーザー更新エラー:", error)
		return NextResponse.json({ error: "ユーザーの更新に失敗しました" }, { status: 500 })
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const session = await getServerSession()

		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
		}

		// 自分自身を削除できないようにする
		if (id === session.user.id) {
			return NextResponse.json({ error: "自分自身を削除することはできません" }, { status: 400 })
		}

		// ユーザーの存在確認
		const existingUser = await prisma.user.findUnique({
			where: { id },
		})

		if (!existingUser) {
			return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
		}

		// 論理削除（deletedAtを設定）
		const user = await prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
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
		})

		return NextResponse.json({ user })
	} catch (error) {
		console.error("ユーザー削除エラー:", error)
		return NextResponse.json({ error: "ユーザーの削除に失敗しました" }, { status: 500 })
	}
}
