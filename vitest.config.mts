import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
    include: ['src/**/*.test.tsx'],
    setupFiles: './vitest.setup.ts',
    coverage: {
      include: ['src/'],
    },
	},
	resolve: {
		alias: {
			"@/": "/src/",
		},
	},
})
