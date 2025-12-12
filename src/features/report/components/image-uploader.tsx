"use client"

import { Loader2, Upload, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/image-constants"
import { cn } from "@/lib/utils"

interface FileWithPreview extends File {
	preview?: string
}

interface UploadedImage {
	id: string
	s3Url: string
	s3Key: string
	order: number
}

interface ImageUploaderProps {
	reportId: string
	onUploadSuccess?: (images: UploadedImage[]) => void
	className?: string
}

export function ImageUploader({ reportId, onUploadSuccess, className }: ImageUploaderProps) {
	const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
	const [isUploading, setIsUploading] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const selectedFilesRef = useRef<FileWithPreview[]>([])
	const { toast } = useToast()

	// selectedFilesの変更をrefにも反映
	useEffect(() => {
		selectedFilesRef.current = selectedFiles
	}, [selectedFiles])

	const validateFile = useCallback((file: File): string | null => {
		if (file.size > MAX_FILE_SIZE) {
			return `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです。`
		}

		if (!ALLOWED_MIME_TYPES.includes(file.type)) {
			return "対応していないファイル形式です。JPEG、PNG、WebPのみ対応しています。"
		}

		return null
	}, [])

	const createPreview = useCallback((file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = reject
			reader.readAsDataURL(file)
		})
	}, [])

	const handleFileSelect = useCallback(
		async (files: FileList | null) => {
			if (!files || files.length === 0) return

			const fileArray = Array.from(files)
			const validFiles: FileWithPreview[] = []

			for (const file of fileArray) {
				const error = validateFile(file)
				if (error) {
					toast({
						title: "ファイルエラー",
						description: `${file.name}: ${error}`,
						variant: "destructive",
					})
					continue
				}

				const preview = await createPreview(file)
				validFiles.push(Object.assign(file, { preview }))
			}

			if (validFiles.length > 0) {
				setSelectedFiles((prev) => [...prev, ...validFiles])
			}
		},
		[toast, validateFile, createPreview],
	)

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e.target.files)
		// 同じファイルを再度選択できるようにリセット
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
		handleFileSelect(e.dataTransfer.files)
	}

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => {
			const newFiles = [...prev]
			const file = newFiles[index]
			if (file.preview) {
				URL.revokeObjectURL(file.preview)
			}
			newFiles.splice(index, 1)
			return newFiles
		})
	}

	const handleUpload = async () => {
		if (selectedFiles.length === 0) {
			toast({
				title: "エラー",
				description: "アップロードするファイルを選択してください",
				variant: "destructive",
			})
			return
		}

		setIsUploading(true)

		try {
			const formData = new FormData()
			selectedFiles.forEach((file) => {
				formData.append("files", file)
			})

			const response = await fetch(`/api/reports/${reportId}/images`, {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "アップロードに失敗しました")
			}

			const data = await response.json()
			const uploadedImages: UploadedImage[] = data.images

			// プレビュー用のURLをクリーンアップ
			selectedFiles.forEach((file) => {
				if (file.preview) {
					URL.revokeObjectURL(file.preview)
				}
			})

			setSelectedFiles([])

			// 警告がある場合（一部成功、一部失敗）
			if (data.warnings && data.warnings.length > 0) {
				toast({
					title: "一部のアップロードに失敗しました",
					description: data.message || `${uploadedImages.length}件成功、${data.warnings.length}件失敗`,
					variant: "destructive",
				})
			} else {
				toast({
					title: "アップロード成功",
					description: `${uploadedImages.length}件の画像をアップロードしました`,
				})
			}

			onUploadSuccess?.(uploadedImages)
		} catch (error) {
			console.error("アップロードエラー:", error)

			// ネットワークエラーの処理
			if (error instanceof TypeError && error.message.includes("fetch")) {
				toast({
					title: "ネットワークエラー",
					description: "サーバーに接続できませんでした。ネットワーク接続を確認してください",
					variant: "destructive",
				})
			} else {
				toast({
					title: "アップロードエラー",
					description: error instanceof Error ? error.message : "画像のアップロードに失敗しました",
					variant: "destructive",
				})
			}
		} finally {
			setIsUploading(false)
		}
	}

	// クリーンアップ（コンポーネントのアンマウント時）
	useEffect(() => {
		return () => {
			selectedFilesRef.current.forEach((file) => {
				if (file.preview) {
					URL.revokeObjectURL(file.preview)
				}
			})
		}
	}, []) // アンマウント時のみ実行

	return (
		<div className={cn("space-y-4", className)}>
			{/* ファイル選択エリア */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: ドラッグ&ドロップ用のdivのため */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"border-2 border-dashed rounded-lg p-8 text-center transition-colors",
					isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
				)}
			>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					accept="image/jpeg,image/jpg,image/png,image/webp"
					onChange={handleInputChange}
					className="hidden"
					disabled={isUploading}
				/>
				<Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
				<p className="text-sm text-muted-foreground mb-2">
					画像をドラッグ&ドロップするか、クリックして選択してください
				</p>
				<p className="text-xs text-muted-foreground mb-4">JPEG、PNG、WebP形式、最大10MBまで</p>
				<Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
					ファイルを選択
				</Button>
			</div>

			{/* 選択されたファイルのプレビュー */}
			{selectedFiles.length > 0 && (
				<div className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{selectedFiles.map((file, index) => (
							<div key={`${file.name}-${file.size}-${index}`} className="relative group">
								<div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
									{file.preview && (
										// biome-ignore lint/performance/noImgElement: プレビュー用のDataURLのためNext.js Imageは使用不可
										<img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
									)}
								</div>
								<button
									type="button"
									onClick={() => removeFile(index)}
									className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
									disabled={isUploading}
								>
									<X className="h-4 w-4" />
								</button>
								<p className="mt-1 text-xs text-muted-foreground truncate">{file.name}</p>
								<p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
							</div>
						))}
					</div>
					<Button type="button" onClick={handleUpload} disabled={isUploading} className="w-full">
						{isUploading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								アップロード中...
							</>
						) : (
							`${selectedFiles.length}件の画像をアップロード`
						)}
					</Button>
				</div>
			)}
		</div>
	)
}
