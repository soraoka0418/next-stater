import List from "@/components/Base/List"
import { ListProps } from "@mui/material/List"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: ListProps = {
	children: "test",
}

describe("Listコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<List {...dummyProps} />)
		const list = getByText("test")
		expect(list).toBeInTheDocument()
	})
})
