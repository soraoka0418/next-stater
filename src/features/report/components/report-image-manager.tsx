"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ImagePreview } from "./image-preview"
import { ImageUploader } from "./image-uploader"

interface ReportImage {
	id: string
	s3Url: string
	s3Key: string
	caption?: string | null
	order: number
	createdAt: Date
}

interface ReportImageManagerProps {
	reportId: string
	initialImages: ReportImage[]
}

export function ReportImageManager({ reportId, initialImages }: ReportImageManagerProps) {
	const [images, setImages] = useState<ReportImage[]>(initialImages)
	const router = useRouter()

	const handleUploadSuccess = () => {
		// サーバーコンポーネントのデータをリフレッシュ
		router.refresh()
		// ローカル状態も更新（オプション）
		// 実際にはrouter.refresh()でサーバーコンポーネントが再レンダリングされるので、
		// 親コンポーネントから新しいinitialImagesが渡される
	}

	const handleDeleteSuccess = (imageId: string) => {
		// サーバーコンポーネントのデータをリフレッシュ
		router.refresh()
		// ローカル状態から削除
		setImages((prev) => prev.filter((img) => img.id !== imageId))
	}

	return (
		<div className="space-y-8">
			{/* 既存画像のプレビュー */}
			{images.length > 0 && <ImagePreview images={images} reportId={reportId} onDeleteSuccess={handleDeleteSuccess} />}

			{/* 画像アップロード */}
			<div>
				<h3 className="text-lg font-semibold mb-4">画像をアップロード</h3>
				<ImageUploader reportId={reportId} onUploadSuccess={handleUploadSuccess} />
			</div>
		</div>
	)
}
