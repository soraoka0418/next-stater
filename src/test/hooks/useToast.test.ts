import { useToast } from "@/hooks/useToast"
import { renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
const TOAST_LIMIT = 1
// const TOAST_REMOVE_DELAY = 1000000
describe.todo("useToast", () => {
	test("トーストを追加できる", () => {
		const { result } = renderHook(() => useToast())

		expect(result.current.toasts).toHaveLength(1)
		expect(result.current.toasts[0].title).toBe("新しいトースト")
	})

	test("トーストの数が制限を超えない", () => {
		const { result } = renderHook(() => useToast())

		expect(result.current.toasts).toHaveLength(TOAST_LIMIT)
	})

	test("トーストを削除できる", () => {
		const { result } = renderHook(() => useToast())

		expect(result.current.toasts).toHaveLength(0)
	})

	test("トーストが一定時間後に自動で削除される", () => {
		const { result } = renderHook(() => useToast())

		expect(result.current.toasts).toHaveLength(0)
	})
})
