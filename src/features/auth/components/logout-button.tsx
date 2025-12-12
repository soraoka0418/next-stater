"use client"

import { signOut } from "next-auth/react"
import type { ButtonProps } from "@/components/ui/button"
import { Button } from "@/components/ui/button"

interface LogoutButtonProps extends ButtonProps {
	children?: React.ReactNode
}

export function LogoutButton({ children, ...props }: LogoutButtonProps) {
	const handleLogout = async () => {
		await signOut({ callbackUrl: "/login" })
	}

	return (
		<Button onClick={handleLogout} {...props}>
			{children || "ログアウト"}
		</Button>
	)
}
