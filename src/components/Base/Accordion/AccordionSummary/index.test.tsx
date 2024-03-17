import AccordionSummary from "@/components/Base/Accordion/AccordionSummary"
import { AccordionSummaryProps } from "@mui/material/AccordionSummary"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: AccordionSummaryProps = {
	children: "test",
}

describe("AccordionSummaryコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<AccordionSummary {...dummyProps} />)
		const accordionSummary = getByText("test")
		expect(accordionSummary).toBeInTheDocument()
	})
})
