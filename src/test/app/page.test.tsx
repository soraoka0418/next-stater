import { render, screen } from "@testing-library/react"
import { expect, test, vi } from "vitest"
import Page from "@/app/page"

// Next.jsのルーターをモック
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => ({
		get: vi.fn(),
	}),
}))

test("Page", () => {
	render(<Page />)
	expect(screen.getByRole("heading", { name: "アカウントにログイン" })).toBeDefined()
})
