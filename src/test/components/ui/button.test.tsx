import { Button } from "@/components/ui/button"
import { render } from "@testing-library/react"
import Link from "next/link"
import { describe, expect, test } from "vitest"

describe("Buttonコンポーネント", () => {
	test("asChildがfalseの場合、buttonがレンダリングされる", () => {
		const { getByRole } = render(<Button>テスト</Button>)
		const buttonElement = getByRole("button")
		expect(buttonElement).toBeInTheDocument()
	})

	test("asChildがtrueの場合、slotがレンダリングされる", () => {
		const { getByText } = render(
			<Button asChild>
				<Link href="/login">Login</Link>
			</Button>,
		)
		const linkElement = getByText("Login")
		expect(linkElement).toBeInTheDocument()

		expect(linkElement).toHaveAttribute("href", "/login")
	})
})
