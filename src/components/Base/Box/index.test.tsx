import Box from "@/components/Base/Box"
import { BoxProps } from "@mui/material/Box"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: BoxProps = {
	children: "test",
}

describe("Boxコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<Box {...dummyProps} />)
		const box = getByText("test")
		expect(box).toBeInTheDocument()
	})
})
