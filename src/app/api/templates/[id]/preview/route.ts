import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params

	try {
		const template = await prisma.template.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				description: true,
				currentVersion: {
					select: {
						id: true,
						version: true,
						status: true,
						content: true,
						fields: { orderBy: { order: "asc" } },
					},
				},
			},
		})

		if (!template || !template.currentVersion) {
			return NextResponse.json({ error: "テンプレートが見つかりません" }, { status: 404 })
		}

		return NextResponse.json({ template })
	} catch (error) {
		console.error("テンプレートプレビュー取得エラー:", error)
		return NextResponse.json({ error: "プレビュー情報の取得に失敗しました" }, { status: 500 })
	}
}
