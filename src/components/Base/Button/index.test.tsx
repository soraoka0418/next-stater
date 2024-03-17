import Button from "@/components/Base/Button"
import { ButtonProps } from "@mui/material/Button"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: ButtonProps = {
	children: "test",
}

describe("Buttonコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<Button {...dummyProps} />)
		const button = getByText("test")
		expect(button).toBeInTheDocument()
	})
})
