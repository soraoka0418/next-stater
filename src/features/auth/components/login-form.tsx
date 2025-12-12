"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/useToast"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
	email: z.email({ message: "有効なメールアドレスを入力してください" }),
	password: z.string().min(1, { message: "パスワードを入力してください" }),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * callbackUrlが安全かどうかを検証する
 * 相対パス（/で始まる）または同じオリジンからのURLのみを許可
 */
function isValidCallbackUrl(url: string | null): boolean {
	if (!url) return false

	// 相対パスの場合（/で始まる）
	if (url.startsWith("/")) {
		// 相対パス内で//が含まれていないことを確認（プロトコル相対URLを防ぐ）
		return !url.startsWith("//")
	}

	// 絶対URLの場合、同じオリジンかどうかを確認
	try {
		const urlObj = new URL(url, window.location.origin)
		return urlObj.origin === window.location.origin
	} catch {
		// URLの解析に失敗した場合は無効
		return false
	}
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()
	const searchParams = useSearchParams()
	const { toast } = useToast()

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	})

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true)

		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			})

			if (result?.error) {
				toast({
					title: "ログインに失敗しました",
					description: "メールアドレスまたはパスワードが正しくありません",
					variant: "destructive",
				})
			} else {
				const rawCallbackUrl = searchParams.get("callbackUrl")
				const callbackUrl = rawCallbackUrl && isValidCallbackUrl(rawCallbackUrl) ? rawCallbackUrl : "/dashboard"
				router.push(callbackUrl)
				router.refresh()
			}
		} catch {
			toast({
				title: "エラーが発生しました",
				description: "ログイン処理中にエラーが発生しました。もう一度お試しください。",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>アカウントにログイン</CardTitle>
					<CardDescription>アカウントにログインするには、メールアドレスを入力してください</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">メールアドレス</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="example@example.com"
									{...register("email")}
									aria-invalid={errors.email ? "true" : "false"}
								/>
								{errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">パスワード</FieldLabel>
									<a href="/" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
										パスワードをお忘れですか？
									</a>
								</div>
								<Input
									id="password"
									type="password"
									{...register("password")}
									aria-invalid={errors.password ? "true" : "false"}
								/>
								{errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
							</Field>
							<Field>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "ログイン中..." : "ログイン"}
								</Button>
								<Button variant="outline" type="button" className="w-full" disabled>
									Googleでログイン
								</Button>
								<FieldDescription className="text-center">
									アカウントをお持ちでない方は <a href="/signup">新規登録</a>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
