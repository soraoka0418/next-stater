import { redirect } from "next/navigation"
import { TemplateForm } from "@/features/template/components/template-form"
import { getServerSession } from "@/lib/auth-utils"

export default async function TemplateNewPage() {
	const session = await getServerSession()

	if (!session?.user || session.user.role !== "admin") {
		redirect("/dashboard")
	}

	return (
		<div className="container py-8 space-y-6">
			<div>
				<h1 className="text-2xl font-bold">テンプレート作成</h1>
				<p className="text-sm text-muted-foreground">新しいテンプレートを作成します。</p>
			</div>
			<TemplateForm redirectTo={(id) => `/templates/${id}/preview`} />
		</div>
	)
}
