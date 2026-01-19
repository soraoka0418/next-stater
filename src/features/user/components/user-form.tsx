"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import type { User } from "@/types/user"

interface UserFormProps {
	initialUser?: User
	onSuccess?: () => void
	redirectTo?: string
}

const createUserSchema = (isEdit: boolean) =>
	z.object({
		email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
		name: z.string().optional(),
		role: z.enum(["admin", "user"], {
			required_error: "ロールを選択してください",
		}),
		password: isEdit
			? z.string().min(8, { message: "パスワードは8文字以上で入力してください" }).optional().or(z.literal(""))
			: z.string().min(8, { message: "パスワードは8文字以上で入力してください" }).optional(),
	})

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

export function UserForm({ initialUser, onSuccess, redirectTo }: UserFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const isEdit = !!initialUser

	const schema = createUserSchema(isEdit)
	const form = useForm<UserFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: initialUser?.email ?? "",
			name: initialUser?.name ?? "",
			role: (initialUser?.role as "admin" | "user") ?? "user",
			password: "",
		},
	})

	const handleSubmit = form.handleSubmit(async (values) => {
		setIsSubmitting(true)

		try {
			const url = isEdit ? `/api/users/${initialUser.id}` : "/api/users"
			const method = isEdit ? "PATCH" : "POST"

			const payload: {
				email: string
				name?: string
				role: "admin" | "user"
				password?: string
			} = {
				email: values.email,
				name: values.name,
				role: values.role,
			}

			// パスワードが入力されている場合のみ送信
			if (values.password?.trim()) {
				payload.password = values.password
			}

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			if (!response.ok) {
				const error = await response.json().catch(() => ({}))
				throw new Error(error.error ?? "保存に失敗しました")
			}

			toast({
				title: isEdit ? "ユーザーを更新しました" : "ユーザーを作成しました",
			})

			if (redirectTo) {
				router.push(redirectTo)
				return
			}

			router.refresh()
			onSuccess?.()
		} catch (error) {
			const message = error instanceof Error ? error.message : "保存に失敗しました"
			toast({
				title: "エラーが発生しました",
				description: message,
				variant: "destructive",
			})
		} finally {
			setIsSubmitting(false)
		}
	})

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{isEdit ? "ユーザーを編集" : "ユーザーを作成"}</CardTitle>
					<CardDescription>{isEdit ? "ユーザー情報を編集します" : "新しいユーザーを作成します"}</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">メールアドレス *</FieldLabel>
							<Input id="email" type="email" placeholder="user@example.com" {...form.register("email")} />
							{form.formState.errors.email && (
								<FieldDescription className="text-destructive">{form.formState.errors.email.message}</FieldDescription>
							)}
						</Field>

						<Field>
							<FieldLabel htmlFor="name">名前</FieldLabel>
							<Input id="name" placeholder="山田 太郎" {...form.register("name")} />
							{form.formState.errors.name && (
								<FieldDescription className="text-destructive">{form.formState.errors.name.message}</FieldDescription>
							)}
						</Field>

						<Field>
							<FieldLabel htmlFor="role">ロール *</FieldLabel>
							<Select
								value={form.watch("role")}
								onValueChange={(value) => form.setValue("role", value as "admin" | "user")}
							>
								<SelectTrigger id="role">
									<SelectValue placeholder="ロールを選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">一般ユーザー</SelectItem>
									<SelectItem value="admin">管理者</SelectItem>
								</SelectContent>
							</Select>
							{form.formState.errors.role && (
								<FieldDescription className="text-destructive">{form.formState.errors.role.message}</FieldDescription>
							)}
						</Field>

						<Field>
							<FieldLabel htmlFor="password">パスワード {isEdit ? "(変更する場合のみ入力)" : "(任意)"}</FieldLabel>
							<Input
								id="password"
								type="password"
								placeholder={isEdit ? "変更しない場合は空欄のまま" : "8文字以上"}
								{...form.register("password")}
							/>
							<FieldDescription>
								{isEdit
									? "パスワードを変更する場合のみ入力してください"
									: "パスワードを設定しない場合、後で設定できます"}
							</FieldDescription>
							{form.formState.errors.password && (
								<FieldDescription className="text-destructive">
									{form.formState.errors.password.message}
								</FieldDescription>
							)}
						</Field>
					</FieldGroup>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						キャンセル
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "保存中..." : isEdit ? "更新する" : "作成する"}
					</Button>
				</CardFooter>
			</Card>
		</form>
	)
}
