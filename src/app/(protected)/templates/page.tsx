import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateList } from "@/features/template/components/template-list"
import { TemplateSearch } from "@/features/template/components/template-search"
import { getServerSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import type { TemplateStatus } from "@/types/template"

interface TemplatesPageProps {
	searchParams: Promise<{ q?: string; status?: TemplateStatus; sort?: "asc" | "desc" }>
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
	const session = await getServerSession()
	if (!session?.user) {
		redirect("/login")
	}

	const params = await searchParams
	const search = params.q?.trim()
	const status = params.status
	const sort = params.sort === "asc" ? "asc" : "desc"

	const templates = await prisma.template.findMany({
		where: {
			AND: [
				search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" } },
								{ description: { contains: search, mode: "insensitive" } },
							],
						}
					: {},
				status ? { currentVersion: { status } } : {},
			],
		},
		include: {
			currentVersion: {
				include: { fields: { orderBy: { order: "asc" } } },
			},
		},
		orderBy: { createdAt: sort },
	})

	return (
		<div className="container py-8 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">テンプレート一覧</h1>
					<p className="text-sm text-muted-foreground">テンプレートの検索と管理ができます。</p>
				</div>
				{session.user.role === "admin" && (
					<Button asChild>
						<Link href="/templates/new">新規作成</Link>
					</Button>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>検索・フィルタ</CardTitle>
				</CardHeader>
				<CardContent>
					<TemplateSearch />
				</CardContent>
			</Card>

			<TemplateList templates={templates} isAdmin={session.user.role === "admin"} />
		</div>
	)
}
