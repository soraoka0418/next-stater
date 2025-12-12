"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"

interface PDFDownloadButtonProps {
	reportId: string
	title?: string
	variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link"
	size?: "default" | "sm" | "lg" | "icon"
	className?: string
}

export function PDFDownloadButton({
	reportId,
	title,
	variant = "outline",
	size = "default",
	className,
}: PDFDownloadButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false)
	const { toast } = useToast()

	const handleDownload = async () => {
		setIsDownloading(true)
		try {
			const response = await fetch(`/api/reports/${reportId}/pdf`)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "PDFのダウンロードに失敗しました")
			}

			// レスポンスからファイル名を取得
			const contentDisposition = response.headers.get("Content-Disposition")
			let fileName = `report_${reportId.slice(0, 8)}.pdf`
			if (contentDisposition) {
				const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
				if (fileNameMatch) {
					fileName = decodeURIComponent(fileNameMatch[1])
				}
			}

			// Blobとして取得
			const blob = await response.blob()

			// ダウンロード
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = fileName
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)

			toast({
				title: "PDFをダウンロードしました",
				description: "報告書のPDFを正常にダウンロードしました",
			})
		} catch (error) {
			console.error("PDFダウンロードエラー:", error)
			toast({
				title: "エラー",
				description: error instanceof Error ? error.message : "PDFのダウンロードに失敗しました",
				variant: "destructive",
			})
		} finally {
			setIsDownloading(false)
		}
	}

	return (
		<Button
			type="button"
			variant={variant}
			size={size}
			onClick={handleDownload}
			disabled={isDownloading}
			className={className}
		>
			{isDownloading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					生成中...
				</>
			) : (
				<>
					<Download className="mr-2 h-4 w-4" />
					{title || "PDFをダウンロード"}
				</>
			)}
		</Button>
	)
}
