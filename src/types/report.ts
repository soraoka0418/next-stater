export interface ReportImage {
	id: string
	s3Url: string
	s3Key: string
	caption?: string | null
	order: number
	createdAt: Date
}
