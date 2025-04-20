import "./globals.css";
import {ReactNode} from "react";
import {ModelProvider} from "@/context/ModelContext";
import {Metadata} from "next";

export const metadata: Metadata = {
	title: "BikeFit",
	description: "Pose Estimation for Cyclists",
}

export default function RootLayout({children}: {children: ReactNode}) {
	return (
		<html lang="en">
			<body>
				<ModelProvider>
					{children}
				</ModelProvider>
			</body>
		</html>
	)
}
