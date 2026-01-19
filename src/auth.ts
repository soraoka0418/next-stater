import type { NextAuthConfig } from "next-auth"
import NextAuth, { type DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
	interface Session {
		user: {
			id: string
			role: string
		} & DefaultSession["user"]
	}

	interface User {
		role: string
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string
		role: string
	}
}

export const authConfig = {
	session: {
		strategy: "jwt" as const,
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials): Promise<{ id: string; email: string; name: string | null; role: string } | null> {
				// 動的インポートでPrisma Clientに依存しないようにする（Edge Runtime対応）
				const { authorizeCredentials } = await import("@/lib/auth-credentials")
				return await authorizeCredentials(credentials)
			},
		}),
	],
	callbacks: {
		async jwt({
			token,
			user,
		}: {
			token: JWT
			user?: { id: string; email: string; name: string | null; role: string }
		}) {
			if (user) {
				token.id = user.id
				token.role = user.role
			}
			return token
		},
		async session({ session, token }: { session: DefaultSession; token: JWT }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.role = token.role as string
			}
			return session
		},
	},
	secret: (() => {
		const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
		if (!secret) {
			throw new Error(
				"Missing AUTH_SECRET or NEXTAUTH_SECRET environment variable. Please set one of them in your .env file.",
			)
		}
		return secret
	})(),
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
