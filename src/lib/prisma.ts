import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../prisma/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set")
}

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
})

const prismaClient =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient

export const prisma: PrismaClient = prismaClient
