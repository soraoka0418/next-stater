import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
		setupFiles: "./vitest.setup.ts",
		coverage: {
			include: ["src/"],
			exclude: ["src/**/layout.tsx"],
		},
	},
	resolve: {
		alias: {
			"@/": "/src/",
		},
	},
})
