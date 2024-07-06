import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"

function TestToolTip() {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>テスト</TooltipTrigger>
				<TooltipContent>テスト用ツールチップ</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

describe("TooltipComponent", () => {
	test("ツールチップがレンダリングされること", () => {
		const { getByText } = render(<TestToolTip />)
		const triggerButton = getByText("テスト")

		expect(triggerButton).toBeInTheDocument()
	})

	test("hover前はツールチップはレンダリングされていないこと", () => {
		const { queryByText } = render(<TestToolTip />)

		expect(queryByText("テスト用ツールチップ")).toBeNull()
	})

	test("hoverによってtooltipがレンダリングされること", async () => {
		const user = userEvent.setup()
		const { getByText, getByRole } = render(<TestToolTip />)
		const tooltipTrigger = getByText("テスト")
		user.hover(tooltipTrigger)

		await waitFor(() => {
			const tooltipContent = getByRole("tooltip")
			expect(tooltipContent).toBeInTheDocument()
		})
	})
})
