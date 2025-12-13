import { hash } from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { CreateUserRequest } from "@/types/user"

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const search = searchParams.get("search") || undefined
		const role = searchParams.get("role") as "admin" | "user" | null
		const deleted = searchParams.get("deleted") === "true"

		// 検索条件の構築
		const where: {
			deletedAt: null | { not: null }
			role?: string
			OR?: Array<
				| { email: { contains: string; mode: "insensitive" } }
				| { name: { contains: string; mode: "insensitive" } | null }
			>
		} = {
			deletedAt: deleted ? { not: null } : null,
		}

		if (role) {
			where.role = role
		}

		if (search) {
			where.OR = [
				{ email: { contains: search, mode: "insensitive" } },
				{ name: { contains: search, mode: "insensitive" } },
			]
		}

		// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはdeletedAtフィールドは存在する
		const users = await prisma.user.findMany({
			where,
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

		return NextResponse.json({ users })
	} catch (error) {
		console.error("ユーザー一覧取得エラー:", error)
		return NextResponse.json({ error: "ユーザー一覧の取得に失敗しました" }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
		}

		const body = (await request.json()) as CreateUserRequest
		const { email, name, role = "user", password } = body

		if (!email?.trim()) {
			return NextResponse.json({ error: "メールアドレスは必須です" }, { status: 400 })
		}

		// メールアドレスの重複チェック
		const existingUser = await prisma.user.findUnique({
			where: { email: email.trim() },
		})

		if (existingUser) {
			return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 400 })
		}

		// パスワードのハッシュ化（パスワードが提供されている場合）
		let passwordHash: string | undefined
		if (password?.trim()) {
			passwordHash = await hash(password.trim(), 10)
		}

		// ユーザーを作成
		// @ts-expect-error - Prisma型定義のキャッシュ問題。実際にはpasswordHashとdeletedAtフィールドは存在する
		const user = await prisma.user.create({
			data: {
				email: email.trim(),
				name: name?.trim() || null,
				role,
				passwordHash: passwordHash || null,
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

		return NextResponse.json({ user }, { status: 201 })
	} catch (error) {
		console.error("ユーザー作成エラー:", error)
		return NextResponse.json({ error: "ユーザーの作成に失敗しました" }, { status: 500 })
	}
}
