import {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"

describe("ToastComponent", () => {
	test("ToastComponentが正しくレンダリングされること", () => {
		const { getByText } = render(
			<ToastProvider>
				<Toast open>
					<ToastTitle>Test Toast</ToastTitle>
					<ToastDescription>This is a test description</ToastDescription>
				</Toast>
				<ToastViewport />
			</ToastProvider>,
		)

		const title = getByText("Test Toast")
		const description = getByText("This is a test description")

		expect(title).toBeInTheDocument()
		expect(description).toBeInTheDocument()
	})

	test("バリアントに基づいたスタイルを持つこと", () => {
		const { getByText } = render(
			<ToastProvider>
				<Toast variant="destructive" open>
					<ToastTitle>Destructive Toast</ToastTitle>
					<ToastDescription>This is a destructive message</ToastDescription>
				</Toast>
				<ToastViewport />
			</ToastProvider>,
		)

		const toastTitle = getByText("Destructive Toast")
		const toast = toastTitle.closest("li")

		expect(toast).toHaveClass("border-destructive")
		expect(toast).toHaveClass("bg-destructive")
		expect(toast).toHaveClass("text-destructive-foreground")
	})

	test("ToastActionでクリックイベントが呼ばれること", async () => {
		const user = userEvent.setup()
		const onActionClick = vi.fn()
		const { getByRole } = render(
			<ToastProvider>
				<Toast open>
					<ToastTitle>Toast Action</ToastTitle>
					<ToastAction onClick={onActionClick} altText="action" />
				</Toast>
				<ToastViewport />
			</ToastProvider>,
		)

		const actionButton = getByRole("button")
		await user.click(actionButton)

		expect(onActionClick).toHaveBeenCalled()
	})

	test("ToastCloseでクリックイベントが呼ばれること", async () => {
		const user = userEvent.setup()
		const onActionClose = vi.fn()

		const { getByRole } = render(
			<ToastProvider>
				<Toast open>
					<ToastTitle>Closable Toast</ToastTitle>
					<ToastClose onClick={onActionClose} />
				</Toast>
				<ToastViewport />
			</ToastProvider>,
		)

		const closeButton = getByRole("button")
		await user.click(closeButton)

		expect(onActionClose).toHaveBeenCalled()
	})
})
