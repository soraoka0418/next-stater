import { defineConfig } from "@prisma/config"
import { config } from "dotenv"

// .envファイルを読み込む
config()

/**
 * Prisma 7 では datasource.url を schema から分離します。
 * DATABASE_URL は .env に定義してください。
 */
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})

