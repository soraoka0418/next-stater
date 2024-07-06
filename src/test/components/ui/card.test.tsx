import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

function TestCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card Description</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card Content</p>
			</CardContent>
			<CardFooter>
				<p>Card Footer</p>
			</CardFooter>
		</Card>
	)
}

describe("Cardコンポーネント", () => {
	test("Cardコンポーネントの各部分がレンダリングされること", () => {
		const { getByText } = render(<TestCard />)

		expect(getByText("Card Title")).toBeInTheDocument()
		expect(getByText("Card Description")).toBeInTheDocument()
		expect(getByText("Card Content")).toBeInTheDocument()
		expect(getByText("Card Footer")).toBeInTheDocument()
	})
})
