import AccordionActions from "@/components/Base/Accordion/AccordionActions"
import { AccordionActionsProps } from "@mui/material/AccordionActions"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: AccordionActionsProps = {
	children: "test",
}

describe("AccordionActionsコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<AccordionActions {...dummyProps} />)
		const accordionActions = getByText("test")
		expect(accordionActions).toBeInTheDocument()
	})
})
