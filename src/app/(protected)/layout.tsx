import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-utils"

export interface ProtectedLayoutProps {
	children: React.ReactNode
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
	const session = await getServerSession()

	if (!session) {
		redirect("/login")
	}

	return <>{children}</>
}
