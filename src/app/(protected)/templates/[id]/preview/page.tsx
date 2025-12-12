import { notFound } from "next/navigation"
import { TemplatePreview } from "@/features/template/components/template-preview"
import { prisma } from "@/lib/prisma"

interface TemplatePreviewPageProps {
	params: Promise<{ id: string }>
}

export default async function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
	const { id } = await params

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

	if (!template?.currentVersion) {
		notFound()
	}

	return (
		<div className="container py-8 space-y-6">
			<TemplatePreview
				title={template.name}
				description={template.description}
				status={template.currentVersion.status}
				content={template.currentVersion.content}
				fields={template.currentVersion.fields}
			/>
		</div>
	)
}
