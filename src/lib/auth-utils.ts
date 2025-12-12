import { getServerSession as getServerSessionFn } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getServerSession() {
	return getServerSessionFn(authOptions)
}
