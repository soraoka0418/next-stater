import { Input } from "@/components/ui/input"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

describe("Inputコンポーネント", () => {
	test("コンポーネントが正しくレンダリングされること", () => {
		const { getByPlaceholderText } = render(<Input placeholder="test" />)
		const inputElement = getByPlaceholderText("test")

		expect(inputElement).toBeInTheDocument()
	})

	test("クリック時にフォーカスが当たること", async () => {
		const user = userEvent.setup()
		const { getByPlaceholderText } = render(<Input placeholder="test" />)
		const inputElement = getByPlaceholderText("test")

		await user.click(inputElement)
		expect(inputElement).toHaveFocus()
	})

	test("ユーザーの入力内容が表示されること", async () => {
		const user = userEvent.setup()
		const { getByPlaceholderText, getByDisplayValue } = render(<Input placeholder="test" />)
		const inputElement = getByPlaceholderText("test")
		await user.type(inputElement, "ユーザー入力文字")

		expect(getByDisplayValue("ユーザー入力文字")).toBeInTheDocument()
	})
})
