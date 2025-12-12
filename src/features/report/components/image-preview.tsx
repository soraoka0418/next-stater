"use client"

import { Loader2, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

interface ReportImage {
	id: string
	s3Url: string
	s3Key: string
	caption?: string | null
	order: number
	createdAt: Date
}

interface ImagePreviewProps {
	images: ReportImage[]
	reportId: string
	onDeleteSuccess?: (imageId: string) => void
	className?: string
}

export function ImagePreview({ images, reportId, onDeleteSuccess, className }: ImagePreviewProps) {
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
	const { toast } = useToast()

	const handleDelete = async (imageId: string) => {
		if (deletingIds.has(imageId)) return

		setDeletingIds((prev) => new Set(prev).add(imageId))

		try {
			const response = await fetch(`/api/reports/${reportId}/images/${imageId}`, {
				method: "DELETE",
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "削除に失敗しました")
			}

			toast({
				title: "削除成功",
				description: "画像を削除しました",
			})

			onDeleteSuccess?.(imageId)
		} catch (error) {
			console.error("削除エラー:", error)
			toast({
				title: "削除エラー",
				description: error instanceof Error ? error.message : "画像の削除に失敗しました",
				variant: "destructive",
			})
		} finally {
			setDeletingIds((prev) => {
				const newSet = new Set(prev)
				newSet.delete(imageId)
				return newSet
			})
		}
	}

	if (images.length === 0) {
		return null
	}

	return (
		<div className={cn("space-y-4", className)}>
			<h3 className="text-lg font-semibold">アップロード済み画像 ({images.length}件)</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{images.map((image) => {
					const isDeleting = deletingIds.has(image.id)
					return (
						<div key={image.id} className="relative group">
							<div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
								{/* biome-ignore lint/performance/noImgElement: S3の外部URLのためNext.js Imageは設定が必要 */}
								<img src={image.s3Url} alt={image.caption || "レポート画像"} className="w-full h-full object-cover" />
								{isDeleting && (
									<div className="absolute inset-0 bg-background/80 flex items-center justify-center">
										<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
									</div>
								)}
							</div>
							<button
								type="button"
								onClick={() => handleDelete(image.id)}
								disabled={isDeleting}
								className={cn(
									"absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity",
									isDeleting && "opacity-100",
								)}
							>
								{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
							</button>
							{image.caption && <p className="mt-1 text-xs text-muted-foreground truncate">{image.caption}</p>}
						</div>
					)
				})}
			</div>
		</div>
	)
}
