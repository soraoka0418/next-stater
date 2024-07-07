import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

function TestSelect() {
	return (
		<Select>
			<SelectTrigger>
				<SelectValue placeholder="Theme" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Choose a theme:</SelectLabel>
					<SelectItem value="light">Light</SelectItem>
					<SelectItem value="dark">Dark</SelectItem>
					<SelectItem value="system">System</SelectItem>
				</SelectGroup>
				<SelectSeparator />
				<SelectItem value="custom">Custom</SelectItem>
			</SelectContent>
		</Select>
	)
}

describe("SelectComponent", () => {
	test("selectコンポーネントがレンダリングされること", () => {
		const { getByText } = render(<TestSelect />)
		const triggerElement = getByText("Theme")
		expect(triggerElement).toBeInTheDocument()
	})

	test("トリガーをクリックするとドロップダウンメニューが表示されること", async () => {
		const user = userEvent.setup()
		const { getByRole, getByText } = render(<TestSelect />)

		const triggerButton = getByRole("combobox")
		await user.click(triggerButton)

		expect(getByText("Light")).toBeInTheDocument()
		expect(getByText("Dark")).toBeInTheDocument()
		expect(getByText("System")).toBeInTheDocument()
	})

	test("項目を選択すると、選択状態が更新されること", async () => {
		const user = userEvent.setup()
		const { getByRole, getByText } = render(<TestSelect />)

		const triggerButton = getByRole("combobox")
		await user.click(triggerButton)

		const darkOption = getByText("Dark")
		await user.click(darkOption)

		expect(getByText("Dark")).toBeInTheDocument()
	})
})
