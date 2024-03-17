import ListItemButton from "@/components/Base/List/ListItemButton"
import { ListItemButtonProps } from "@mui/material/ListItemButton"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: ListItemButtonProps = {
	children: "test",
}

describe("ListItemButtonコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<ListItemButton {...dummyProps} />)
		const listItemButton = getByText("test")
		expect(listItemButton).toBeInTheDocument()
	})
})
