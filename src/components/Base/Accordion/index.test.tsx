import Accordion from "@/components/Base/Accordion"
import { AccordionProps } from "@mui/material/Accordion"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: AccordionProps = {
	id: "test id",
	children: "test",
}

describe("Accordionコンポーネント", () => {
	test.todo("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<Accordion {...dummyProps} />)
		const accordion = getByText("test")
		expect(accordion).toBeInTheDocument()
	})
})
