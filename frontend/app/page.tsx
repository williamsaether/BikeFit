'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Main() {
	return (
		<div className={styles.wrapper}>
			<section className={styles.heroSection}>
				<div className={styles.leftContent}>
					<h1 className={styles.title}>
						Smarter Fit. <br /> Stronger Ride.
					</h1>
					<p className={styles.subtitle}>
						Upload a photo, get posture insights, and optimize your setup in minutes.
						<br />
						Wherever you ride, ride right.
					</p>
					<div className={styles.buttonGroup}>
						<Link href="/fitting" className={styles.ctaButton}>
							Try BikeFit
						</Link>
						<Link href="/info" className={styles.secondaryLink}>
							Read about the Project
						</Link>
					</div>
				</div>
				<div className={styles.rightContent}>
					<img className={styles.heropic} src="./images/placeholder.jpeg"></img>
				</div>
			</section>
			<section className={styles.whySection}>
				<h2>Why Bikefit?</h2>
				<ul>
					<li>Injury Prevention</li>
					<li>Enhanced Comfort</li>
					<li>Increased Performance</li>
				</ul>
			</section>
		</div>
	);
}
