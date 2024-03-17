import AppBar from "@/components/Base/AppBar"
import { AppBarProps } from "@mui/material/AppBar"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: AppBarProps = {
	children: "test",
}

describe("AppBarコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<AppBar {...dummyProps} />)
		const appBar = getByText("test")
		expect(appBar).toBeInTheDocument()
	})
})
