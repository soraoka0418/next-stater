import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { generateS3Key, uploadToS3 } from "@/lib/s3"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

function validateFile(file: File): { valid: boolean; error?: string } {
	// ファイルサイズチェック
	if (file.size > MAX_FILE_SIZE) {
		return {
			valid: false,
			error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです。`,
		}
	}

	// MIMEタイプチェック
	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: "対応していないファイル形式です。JPEG、PNG、WebPのみ対応しています。",
		}
	}

	// 拡張子チェック
	const extension = file.name
		.toLowerCase()
		.match(/\.[^.]+$/)
		?.at(0)
	if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
		return {
			valid: false,
			error: "対応していないファイル形式です。JPEG、PNG、WebPのみ対応しています。",
		}
	}

	return { valid: true }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: reportId } = await params

		// 認証チェック
		const session = await getServerSession()
		if (!session?.user?.id) {
			return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
		}

		// レポートの存在確認と権限チェック
		const report = await prisma.report.findUnique({
			where: { id: reportId },
			select: { id: true, authorId: true },
		})

		if (!report) {
			return NextResponse.json({ error: "レポートが見つかりません" }, { status: 404 })
		}

		// レポートの作成者のみアップロード可能
		if (report.authorId !== session.user.id) {
			return NextResponse.json({ error: "このレポートに画像をアップロードする権限がありません" }, { status: 403 })
		}

		// FormDataからファイルを取得
		const formData = await request.formData()
		const files = formData.getAll("files") as File[]

		if (files.length === 0) {
			return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 })
		}

		// 各ファイルをバリデーション
		for (const file of files) {
			const validation = validateFile(file)
			if (!validation.valid) {
				return NextResponse.json({ error: validation.error }, { status: 400 })
			}
		}

		// 既存の画像数を取得してorderを決定
		const existingImagesCount = await prisma.reportImage.count({
			where: { reportId },
		})

		// 各ファイルをアップロード
		const uploadPromises = files.map(async (file, index) => {
			try {
				const arrayBuffer = await file.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)

				const s3Key = generateS3Key(reportId, file.name)
				const s3Url = await uploadToS3(s3Key, buffer, file.type)

				// ReportImageレコードを作成
				const reportImage = await prisma.reportImage.create({
					data: {
						reportId,
						s3Key,
						s3Url,
						order: existingImagesCount + index,
					},
				})

				return {
					success: true as const,
					data: {
						id: reportImage.id,
						s3Url: reportImage.s3Url,
						s3Key: reportImage.s3Key,
						order: reportImage.order,
					},
					fileName: file.name,
				}
			} catch (fileError) {
				console.error(`ファイル ${file.name} のアップロードエラー:`, fileError)
				return {
					success: false as const,
					error: fileError instanceof Error ? fileError.message : "アップロードに失敗しました",
					fileName: file.name,
				}
			}
		})

		const results = await Promise.all(uploadPromises)
		const successful = results.filter((r) => r.success)
		const failed = results.filter((r) => !r.success)

		if (successful.length === 0) {
			return NextResponse.json(
				{
					error: "すべてのファイルのアップロードに失敗しました",
					details: failed.map((f) => ({ fileName: f.fileName, error: f.error })),
				},
				{ status: 500 },
			)
		}

		if (failed.length > 0) {
			// 一部成功、一部失敗
			return NextResponse.json(
				{
					images: successful.map((s) => s.data),
					warnings: failed.map((f) => ({ fileName: f.fileName, error: f.error })),
					message: `${successful.length}件の画像をアップロードしましたが、${failed.length}件のアップロードに失敗しました`,
				},
				{ status: 207 }, // Multi-Status
			)
		}

		return NextResponse.json({ images: successful.map((s) => s.data) }, { status: 201 })
	} catch (error) {
		console.error("画像アップロードエラー:", error)

		// より詳細なエラーメッセージ
		if (error instanceof Error) {
			// AWS S3関連のエラー
			if (error.message.includes("AWS") || error.message.includes("S3")) {
				return NextResponse.json(
					{ error: "S3へのアップロードに失敗しました。設定を確認してください。" },
					{ status: 500 },
				)
			}

			// データベース関連のエラー
			if (error.message.includes("Prisma") || error.message.includes("database")) {
				return NextResponse.json({ error: "データベースエラーが発生しました" }, { status: 500 })
			}
		}

		return NextResponse.json({ error: "画像のアップロードに失敗しました" }, { status: 500 })
	}
}
