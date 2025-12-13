"use client"

import { useRouter } from "next/navigation"
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import type { User } from "@/types/user"

interface UserListProps {
	initialUsers: User[]
}

const roleParser = parseAsStringEnum<"admin" | "user">(["admin", "user"])

export function UserList({ initialUsers }: UserListProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [users, setUsers] = useState<User[]>(initialUsers)
	const [isPending, startTransition] = useTransition()
	const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""))
	const [role, setRole] = useQueryState("role", roleParser.withDefault(null))
	const [showDeleted, setShowDeleted] = useState(false)

	// 検索・フィルタリングに基づいてユーザーを取得
	useEffect(() => {
		const fetchUsers = async () => {
			const params = new URLSearchParams()
			if (search) params.set("search", search)
			if (role) params.set("role", role)
			if (showDeleted) params.set("deleted", "true")

			try {
				const response = await fetch(`/api/users?${params.toString()}`)
				if (!response.ok) throw new Error("ユーザー一覧の取得に失敗しました")
				const data = await response.json()
				setUsers(data.users || [])
			} catch (error) {
				console.error("ユーザー一覧取得エラー:", error)
				toast({
					title: "エラー",
					description: "ユーザー一覧の取得に失敗しました",
					variant: "destructive",
				})
			}
		}

		fetchUsers()
	}, [search, role, showDeleted, toast])

	const handleDelete = async (id: string, email: string) => {
		if (!confirm(`ユーザー「${email}」を削除しますか？`)) return

		startTransition(async () => {
			try {
				const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
				if (!response.ok) {
					const error = await response.json().catch(() => ({}))
					throw new Error(error.error ?? "削除に失敗しました")
				}

				toast({
					title: "ユーザーを削除しました",
				})

				// ユーザー一覧を再取得
				const params = new URLSearchParams()
				if (search) params.set("search", search)
				if (role) params.set("role", role)
				if (showDeleted) params.set("deleted", "true")

				const listResponse = await fetch(`/api/users?${params.toString()}`)
				if (listResponse.ok) {
					const data = await listResponse.json()
					setUsers(data.users || [])
				}
			} catch (error) {
				const message = error instanceof Error ? error.message : "削除に失敗しました"
				toast({
					title: "エラー",
					description: message,
					variant: "destructive",
				})
			}
		})
	}

	const formatDate = (date: Date | string | null) => {
		if (!date) return "-"
		return new Intl.DateTimeFormat("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(new Date(date))
	}

	return (
		<div className="space-y-6">
			{/* 検索・フィルタリング */}
			<Card>
				<CardHeader>
					<CardTitle>検索・フィルタ</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<Field>
							<FieldLabel htmlFor="user-search">検索</FieldLabel>
							<Input
								id="user-search"
								placeholder="メールアドレス・名前で検索"
								value={search}
								onChange={(e) => setSearch(e.target.value || null)}
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="user-role">ロール</FieldLabel>
							<Select
								value={role ?? undefined}
								onValueChange={(value) => setRole(value ? (value as "admin" | "user") : null)}
							>
								<SelectTrigger id="user-role">
									<SelectValue placeholder="すべて" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">一般ユーザー</SelectItem>
									<SelectItem value="admin">管理者</SelectItem>
									<SelectItem value="">すべて</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="show-deleted">削除済み</FieldLabel>
							<Select
								value={showDeleted ? "true" : "false"}
								onValueChange={(value) => setShowDeleted(value === "true")}
							>
								<SelectTrigger id="show-deleted">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="false">表示しない</SelectItem>
									<SelectItem value="true">表示する</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>
				</CardContent>
			</Card>

			{/* ユーザー一覧 */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-bold">ユーザー一覧</h2>
					<Button onClick={() => router.push("/admin/users/new")}>新規作成</Button>
				</div>

				{users.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-muted-foreground">ユーザーが見つかりませんでした</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy={isPending}>
						{users.map((user) => (
							<Card key={user.id} className={user.deletedAt ? "opacity-60" : ""}>
								<CardHeader>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1">
											<CardTitle className="text-lg">{user.name || "（名前なし）"}</CardTitle>
											<CardDescription>{user.email}</CardDescription>
										</div>
										<div className="flex flex-col items-end gap-1">
											<span
												className={`rounded-full px-2 py-1 text-xs font-semibold ${
													user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
												}`}
											>
												{user.role === "admin" ? "管理者" : "一般"}
											</span>
											{user.deletedAt && <span className="text-xs text-destructive">削除済み</span>}
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-2 text-sm text-muted-foreground">
									<div>作成日: {formatDate(user.createdAt)}</div>
									<div>更新日: {formatDate(user.updatedAt)}</div>
									{user.emailVerified && <div>認証日: {formatDate(user.emailVerified)}</div>}
								</CardContent>
								<CardContent className="flex items-center justify-end gap-2 pt-0">
									<Button variant="outline" size="sm" onClick={() => router.push(`/admin/users/${user.id}`)}>
										編集
									</Button>
									{!user.deletedAt && (
										<Button
											variant="destructive"
											size="sm"
											onClick={() => handleDelete(user.id, user.email)}
											disabled={isPending}
										>
											削除
										</Button>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
