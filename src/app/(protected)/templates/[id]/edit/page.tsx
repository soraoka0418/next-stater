import { notFound, redirect } from "next/navigation"
import { TemplateForm } from "@/features/template/components/template-form"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

interface TemplateEditPageProps {
	params: Promise<{ id: string }>
}

export default async function TemplateEditPage({ params }: TemplateEditPageProps) {
	const session = await getServerSession()
	if (!session?.user || session.user.role !== "admin") {
		redirect("/dashboard")
	}

	const { id } = await params
	const template = await prisma.template.findUnique({
		where: { id },
		include: {
			currentVersion: {
				include: { fields: { orderBy: { order: "asc" } } },
			},
		},
	})

	if (!template) {
		notFound()
	}

	return (
		<div className="container py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">テンプレート編集</h1>
				<p className="text-sm text-muted-foreground">{template.name}</p>
			</div>
			<TemplateForm initialTemplate={template} />
		</div>
	)
}
