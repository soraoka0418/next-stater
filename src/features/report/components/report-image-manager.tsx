"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { ReportImage } from "@/types/report"
import { ImagePreview } from "./image-preview"
import { ImageUploader } from "./image-uploader"

interface ReportImageManagerProps {
	reportId: string
	initialImages: ReportImage[]
}

export function ReportImageManager({ reportId, initialImages }: ReportImageManagerProps) {
	const [images, setImages] = useState<ReportImage[]>(initialImages)
	const router = useRouter()

	// initialImagesの変更を監視してローカル状態を更新
	useEffect(() => {
		setImages(initialImages)
	}, [initialImages])

	const handleUploadSuccess = () => {
		// サーバーコンポーネントのデータをリフレッシュ
		router.refresh()
		// 実際にはrouter.refresh()でサーバーコンポーネントが再レンダリングされるので、
		// 親コンポーネントから新しいinitialImagesが渡され、useEffectで自動的に更新される
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
