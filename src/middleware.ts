import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	})

	const { pathname } = request.nextUrl

	// 保護されたルート
	if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
		if (!token) {
			const loginUrl = new URL("/login", request.url)
			loginUrl.searchParams.set("callbackUrl", pathname)
			return NextResponse.redirect(loginUrl)
		}

		// 管理者ルートのチェック
		if (pathname.startsWith("/admin") && (token.role as string) !== "admin") {
			const dashboardUrl = new URL("/dashboard", request.url)
			return NextResponse.redirect(dashboardUrl)
		}
	}

	// ログインページにアクセスした場合、既にログインしている場合はダッシュボードにリダイレクト
	if (pathname.startsWith("/login") && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
}
