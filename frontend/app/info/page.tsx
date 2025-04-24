'use client';

import React from 'react';
import styles from './info.module.css';

export default function InfoPage() {
	return (
		<main className={styles.container}>
			<h1 className={styles.heading}>About This Project</h1>

			<p className={styles.paragraph}>
				This application is developed as part of a research-based assignment for the course <strong>DAT255 – Software Engineering</strong> at <strong>Western Norway University of Applied Sciences (HVL)</strong>.
			</p>

			<p className={styles.paragraph}>
				The goal of the project is to explore how pose estimation and joint angle analysis can be applied to optimize bike fit for amateur cyclists. Users can upload a photo of themselves on their bike, and receive basic feedback based on joint angles like knee extension, hip angle, and arm reach.
			</p>

			<p className={styles.paragraph}>
				This is a student project and is not a commercial product. The functionality is built for demonstration and research purposes only, and the feedback should not be considered professional bike fitting advice.
			</p>

			<p className={styles.paragraph}>
				All feedback is generated automatically using a machine learning model trained on public datasets, and no personal data is stored.
			</p>

			<p className={styles.paragraph}>More info about the project over at the <a href={'https://github.com/williamsaether/BikeFit'} target={'_blank'}>GitHub repository</a>.</p>

			<p className={styles.footerNote}>
				— Created by <a href={'https://github.com/williamsaether'} target={'_blank'}>William</a> and <a href={'https://github.com/omegeland'} target={'_blank'}>Ole-Mathias</a> from HVL, Spring 2025
			</p>
		</main>
	);
}
