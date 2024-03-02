import type { Metadata } from "next"
import type { FC, ReactNode } from "react"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Inter as FontSans } from "next/font/google"
export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
}

const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
})

export interface RootLayoutProps {
	children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
	return (
		<html lang="ja">
			<body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>{children}</body>
		</html>
	)
}

export default RootLayout
