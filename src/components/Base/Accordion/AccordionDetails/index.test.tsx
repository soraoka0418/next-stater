import AccordionDetails from "@/components/Base/Accordion/AccordionDetails"
import { AccordionDetailsProps } from "@mui/material/AccordionDetails"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: AccordionDetailsProps = {
	children: "test",
}

describe("AccordionDetailsコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<AccordionDetails {...dummyProps} />)
		const accordionDetails = getByText("test")
		expect(accordionDetails).toBeInTheDocument()
	})
})
