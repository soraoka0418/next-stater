"use client"

import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TemplateStatus } from "@/types/template"

interface TemplateSearchProps {
	onChange?: (value: { search?: string; status?: TemplateStatus | null; sort?: "asc" | "desc" }) => void
}

const statusParser = parseAsStringEnum<TemplateStatus>(["draft", "published", "archived"])

export function TemplateSearch({ onChange }: TemplateSearchProps) {
	const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))
	const [status, setStatus] = useQueryState("status", statusParser.withDefault(null))
	const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("desc"))

	useEffect(() => {
		onChange?.({ search: search || undefined, status: status ?? undefined, sort: sort === "asc" ? "asc" : "desc" })
	}, [onChange, search, sort, status])

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="space-y-2">
				<Label htmlFor="template-search">検索</Label>
				<Input
					id="template-search"
					placeholder="テンプレート名・説明で検索"
					value={search}
					onChange={(event) => setSearch(event.target.value || null)}
				/>
			</div>

			<div className="space-y-2">
				<Label>ステータス</Label>
				<Select
					value={status ?? undefined}
					onValueChange={(value) => setStatus(value ? (value as TemplateStatus) : null)}
				>
					<SelectTrigger>
						<SelectValue placeholder="すべて" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="draft">下書き</SelectItem>
						<SelectItem value="published">公開</SelectItem>
						<SelectItem value="archived">アーカイブ</SelectItem>
						<SelectItem value="">すべて</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label>並び順</Label>
				<Select value={sort} onValueChange={(value) => setSort(value === "asc" ? "asc" : "desc")}>
					<SelectTrigger>
						<SelectValue placeholder="新しい順" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="desc">新しい順</SelectItem>
						<SelectItem value="asc">古い順</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
