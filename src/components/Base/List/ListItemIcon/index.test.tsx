import ListItemIcon from "@/components/Base/List/ListItemIcon"
import { ListItemIconProps } from "@mui/material/ListItemIcon"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: ListItemIconProps = {
	children: "test",
}

describe("ListItemIconコンポーネント", () => {
	test("正しくレンダリングされるかどうか", () => {
		const { getByText } = render(<ListItemIcon {...dummyProps} />)
		const listItemIcon = getByText("test")
		expect(listItemIcon).toBeInTheDocument()
	})
})
