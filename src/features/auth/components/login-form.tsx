import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>アカウントにログイン</CardTitle>
					<CardDescription>アカウントにログインするには、メールアドレスを入力してください</CardDescription>
				</CardHeader>
				<CardContent>
					<form>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="email">メールアドレス</FieldLabel>
								<Input id="email" type="email" placeholder="example@example.com" required />
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">パスワード</FieldLabel>
									<a href="/" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
										パスワードをお忘れですか？
									</a>
								</div>
								<Input id="password" type="password" required />
							</Field>
							<Field>
								<Button type="submit" className="w-full">
									ログイン
								</Button>
								<Button variant="outline" type="button" className="w-full">
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
