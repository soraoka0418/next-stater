import { cn } from "@/lib/utils"
import { describe, expect, test } from "vitest"

describe("cn関数のテスト", () => {
	test("単純なクラス名を正しく結合する", () => {
		const result = cn("bg-blue-500", "text-white")
		expect(result).toBe("bg-blue-500 text-white")
	})

	test("条件付きのクラスを処理する", () => {
		const result = cn("bg-blue-500", { "text-white": true, "text-red-500": false })
		expect(result).toBe("bg-blue-500 text-white")
	})

	test("クラスを正しくマージする", () => {
		const result = cn("bg-blue-500", "bg-red-500", "text-white")
		expect(result).toBe("bg-red-500 text-white")
	})

	test("配列とオブジェクトを結合する", () => {
		const result = cn(["bg-blue-500", "text-white"], { "p-4": true })
		expect(result).toBe("bg-blue-500 text-white p-4")
	})

	test("重複したクラスを削除する", () => {
		const result = cn("bg-blue-500", "bg-blue-500", "text-white")
		expect(result).toBe("bg-blue-500 text-white")
	})

	test("空の入力を正しく処理する", () => {
		const result = cn()
		expect(result).toBe("")
	})
})
