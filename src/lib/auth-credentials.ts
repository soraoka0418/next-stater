import { compare } from "bcryptjs"

export async function authorizeCredentials(credentials: { email?: string; password?: string } | undefined): Promise<{
	id: string
	email: string
	name: string | null
	role: string
} | null> {
	if (!credentials?.email || !credentials?.password) {
		return null
	}

	try {
		// 動的インポートでPrisma Clientを読み込む（Edge Runtime対応）
		const { prisma } = await import("@/lib/prisma")

		const user = await prisma.user.findUnique({
			where: {
				email: credentials.email,
			},
		})

		if (!user || !user.passwordHash || user.deletedAt) {
			return null
		}

		const isPasswordValid = await compare(credentials.password, user.passwordHash)

		if (!isPasswordValid) {
			return null
		}

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		}
	} catch (error) {
		console.error("Authorization error:", error)
		return null
	}
}
