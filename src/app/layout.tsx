import type { Metadata } from "next";
import "./globals.css";
import { JetBrains_Mono } from "next/font/google";

const font = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
	title: "RealTime Chat Application",
	description:
		"A real-time chat application built with Next.js and ElysiaJS frameworks including socket.io for seamless communication.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body
				className={`${font.variable} antialiased dark`}
				data-new-gr-c-s-check-loaded="14.1268.0"
				data-gr-ext-installed=""
			>
				{children}
			</body>
		</html>
	);
}
