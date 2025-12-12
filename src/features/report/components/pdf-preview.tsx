"use client"

import { FileX, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PDFDownloadButton } from "./pdf-download-button"

interface PDFPreviewProps {
	reportId: string
	title?: string
	className?: string
}

export function PDFPreview({ reportId, title, className }: PDFPreviewProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let objectUrl: string | null = null

		const loadPDF = async () => {
			setIsLoading(true)
			setError(null)
			try {
				const response = await fetch(`/api/reports/${reportId}/pdf`)

				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || "PDFの読み込みに失敗しました")
				}

				const blob = await response.blob()
				objectUrl = window.URL.createObjectURL(blob)
				setPdfUrl(objectUrl)
			} catch (err) {
				console.error("PDF読み込みエラー:", err)
				setError(err instanceof Error ? err.message : "PDFの読み込みに失敗しました")
			} finally {
				setIsLoading(false)
			}
		}

		loadPDF()

		// クリーンアップ
		return () => {
			if (objectUrl) {
				window.URL.revokeObjectURL(objectUrl)
			}
		}
	}, [reportId])

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>PDFプレビュー</CardTitle>
						<CardDescription>報告書のPDFをプレビュー表示しています</CardDescription>
					</div>
					{pdfUrl && <PDFDownloadButton reportId={reportId} title="ダウンロード" variant="outline" size="sm" />}
				</div>
			</CardHeader>
			<CardContent>
				{isLoading && (
					<div className="flex flex-col items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
						<p className="text-sm text-muted-foreground">PDFを読み込んでいます...</p>
					</div>
				)}

				{error && (
					<div className="flex flex-col items-center justify-center py-12">
						<FileX className="h-8 w-8 text-destructive mb-4" />
						<p className="text-sm text-destructive mb-4">{error}</p>
						<PDFDownloadButton reportId={reportId} title="PDFをダウンロード" variant="outline" />
					</div>
				)}

				{pdfUrl && !isLoading && !error && (
					<div className="w-full border rounded-lg overflow-hidden">
						<iframe
							src={pdfUrl}
							title={title || "PDFプレビュー"}
							className="w-full h-[600px] border-0"
							style={{ minHeight: "600px" }}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
