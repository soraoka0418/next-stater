import "dotenv/config"

import type { PrismaConfig } from "prisma"

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set")
}

export default {
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: process.env.DATABASE_URL,
	},
} satisfies PrismaConfig
