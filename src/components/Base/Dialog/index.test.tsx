import Dialog from "@/components/Base/Dialog"
import { DialogProps } from "@mui/material/Dialog"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: DialogProps = {
	open: true,
	children: "test",
}

describe("Dialogコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<Dialog {...dummyProps} />)
		const dialog = getByText("test")
		expect(dialog).toBeInTheDocument()
	})

	test.todo("props open falseの場合コンポーネントは表示されない", () => {})
})
