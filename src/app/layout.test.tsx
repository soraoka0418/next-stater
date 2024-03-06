import RootLayout from "@/app/layout"
import { render } from "@testing-library/react"
import { describe, expect, test } from "vitest"

/**
 * renderメソッドでdivが追加されるためdom構造の不一致のwarnが出る
 * reference  https://testing-library.com/docs/react-testing-library/api/#container
 * Warning: validateDOMNesting(...): <html> cannot appear as a child of <div>.at html
 **/
describe("RootLayout", () => {
	test("子要素が正しく表示されること", () => {
		const ChildComponent = <div>子コンポーネント</div>
		const { getByText } = render(<RootLayout>{ChildComponent}</RootLayout>)

		expect(getByText("子コンポーネント")).toBeInTheDocument()
	})
})
