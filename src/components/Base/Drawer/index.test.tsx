import Drawer from "@/components/Base/Drawer"
import { DrawerProps } from "@mui/material/Drawer"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

const dummyProps: DrawerProps = {
	children: "test",
	open: true,
}

describe("Drawerコンポーネント", () => {
	test("trueの場合レンダリングされる", () => {
		const { getByText } = render(<Drawer {...dummyProps} />)
		const drawer = getByText("test")
		expect(drawer).toBeInTheDocument()
	})

	test.todo("falseの場合レンダリングされない", () => {})
})
