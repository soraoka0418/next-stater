import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

// selectのclickイベントが発火しないための対応
// 参考: https://github.com/testing-library/user-event/discussions/1087
window.HTMLElement.prototype.scrollIntoView = vi.fn()
window.HTMLElement.prototype.hasPointerCapture = vi.fn()

afterEach(() => {
	cleanup()
})
