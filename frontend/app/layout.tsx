import "./globals.css";
import {ReactNode} from "react";
import {ModelProvider} from "@/context/ModelContext";
import {Metadata} from "next";
import styles from './layout.module.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
	title: "BikeFit",
	description: "Pose Estimation for Cyclists",
}

export default function RootLayout({children}: {children: ReactNode}) {
	return (
		<html lang="en">
			<Analytics/>
			<body>
				<header className={styles.header}>
					<nav>
						<div>
							<a href={'/'} className={styles.headerTitle}>BikeFit</a>
						</div>
						<div>
							<a href={'/'}>Home</a>
							<a href={'/info'}>Info</a>
							<a href={'/fitting'} className={styles.headerButton}>Get Started</a>
						</div>
					</nav>
				</header>
				<main className={styles.main}>
					<ModelProvider>
						{children}
					</ModelProvider>
				</main>
				<footer className={styles.footer}>
					<div className={styles.footerContent}>
						<a>Bikefit - 2024<br />Last updated - 2026<br />Student project by Willam and Ole-Mathias</a>
					</div>
				</footer>
				
			</body>
		</html>
	)
}
