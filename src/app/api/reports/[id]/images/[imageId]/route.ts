import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { deleteFromS3 } from "@/lib/s3"

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
	try {
		const { id: reportId, imageId } = await params

		// 認証チェック
		const session = await getServerSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		// レポートと画像の存在確認
		const report = await prisma.report.findUnique({
			where: { id: reportId },
			select: { id: true, authorId: true },
		})

		if (!report) {
			return NextResponse.json({ error: "レポートが見つかりません" }, { status: 404 })
		}

		// レポートの作成者のみ削除可能
		if (report.authorId !== session.user.id) {
			return NextResponse.json({ error: "この画像を削除する権限がありません" }, { status: 403 })
		}

		// 画像の存在確認
		const reportImage = await prisma.reportImage.findUnique({
			where: { id: imageId },
			select: { id: true, s3Key: true, reportId: true },
		})

		if (!reportImage) {
			return NextResponse.json({ error: "画像が見つかりません" }, { status: 404 })
		}

		// レポートIDの整合性チェック
		if (reportImage.reportId !== reportId) {
			return NextResponse.json({ error: "画像がこのレポートに属していません" }, { status: 400 })
		}

		// S3からファイルを削除
		try {
			await deleteFromS3(reportImage.s3Key)
		} catch (s3Error) {
			console.error("S3削除エラー:", s3Error)
			// S3削除に失敗してもDBレコードは削除する（オプション）
		}

		// ReportImageレコードを削除
		await prisma.reportImage.delete({
			where: { id: imageId },
		})

		return NextResponse.json({ message: "画像を削除しました" }, { status: 200 })
	} catch (error) {
		console.error("画像削除エラー:", error)
		return NextResponse.json({ error: "画像の削除に失敗しました" }, { status: 500 })
	}
}
