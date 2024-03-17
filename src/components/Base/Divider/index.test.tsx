import Divider from "@/components/Base/Divider"
import { DividerProps } from "@mui/material/Divider"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: DividerProps = {
	children: "test",
}

describe("Dividerコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<Divider {...dummyProps} />)
		const divider = getByText("test")
		expect(divider).toBeInTheDocument()
	})
})
