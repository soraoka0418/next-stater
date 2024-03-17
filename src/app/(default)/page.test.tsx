import Page from "@/app/(default)/page"
import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"

test("Page", () => {
	render(<Page />)

	expect(screen.getByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument()
})
