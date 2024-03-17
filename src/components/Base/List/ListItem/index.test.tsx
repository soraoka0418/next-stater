import ListItem from "@/components/Base/List/ListItem"
import { ListItemProps } from "@mui/material/ListItem"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: ListItemProps = {
	children: "test",
}

describe("ListItemコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<ListItem {...dummyProps} />)
		const listItem = getByText("test")
		expect(listItem).toBeInTheDocument()
	})
})
