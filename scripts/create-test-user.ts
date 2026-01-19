import "dotenv/config"
import { hash } from "bcryptjs"
import { prisma } from "../src/lib/prisma"

async function createTestUser() {
	try {
		const email = "test@example.com"
		const password = "password123"

		// 既存ユーザーをチェック
		const existing = await prisma.user.findUnique({
			where: { email },
		})

		if (existing) {
			console.log("ユーザーは既に存在します:", email)
			console.log("ID:", existing.id)
			console.log("Name:", existing.name)
			console.log("Role:", existing.role)
			return
		}

		const passwordHash = await hash(password, 10)

		const user = await prisma.user.create({
			data: {
				email,
				name: "Test User",
				role: "user",
				passwordHash,
			},
		})

		console.log("✅ テストユーザーを作成しました:")
		console.log("Email:", user.email)
		console.log("Password:", password)
		console.log("Name:", user.name)
		console.log("Role:", user.role)
	} catch (error) {
		console.error("❌ エラー:", error)
	} finally {
		await prisma.$disconnect()
	}
}

createTestUser()
