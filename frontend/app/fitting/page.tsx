'use client';

import React, {use, useCallback, useRef, useState} from 'react';
import {useModelContext} from "@/context/ModelContext";
import * as tf from "@tensorflow/tfjs";
import {preprocessImage} from "@/lib/preprocessImage";
import {extractJoints} from "@/lib/processPrediction";
import UploadAndCrop from "@/components/ImageUpload";
import styles from './page.module.css'
import Image from "next/image";

const models = new Map<string, string>([
	['default', 'ResNet50'],
	['light', 'Light'],
	['movenet_thunder', 'MoveNet Thunder'],
	['movenet_lightning', 'MoveNet Lightning'],
])

export default function Main() {
	const { model, loading, loadModelByKey, currentModelKey, cachedModels } = useModelContext()
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const [openTutorial, setOpenTutorial] = useState(false)
	const [selectedModel, setSelectedModel] = useState<string>('default')
	const [joints, setJoints] = useState<number[][] | null>(null)

	const canvasRef = useRef(null)

	const handleCroppedImage = async (blob: Blob) => {
		setImageSrc(URL.createObjectURL(blob))
	}

	const predict = () => {
		if (!imageSrc || !model) return
		const img = new global.Image()
		img.src = imageSrc
		img.onload = () => {
			const tensor = tf.browser.fromPixels(img)
			const useInt = currentModelKey !== null && currentModelKey.startsWith('movenet')
			const imageSize = currentModelKey?.endsWith('lightning') ? 192 : 256
			const image = preprocessImage(tensor, imageSize, useInt)
			const pred = model.predict(image) as tf.Tensor4D
			canvasRef.current && plotJoints(canvasRef.current, img, pred, useInt)
		}
	}

	const plotJoints = async (
		canvas: HTMLCanvasElement,
		image: HTMLImageElement,
		predictions: tf.Tensor4D,
		moveNetModel: boolean,
	) => {
		let joints = await extractJoints(predictions, image.naturalWidth, 64)
		setJoints(joints)

		if (moveNetModel) {
			joints = joints.slice(5) // skip the head
			joints = joints.map(([x, y]) => [
				x * image.naturalWidth,
				y * image.naturalHeight
			])
		}

		const leftSide = joints[4][0] < joints[6][0]
		let skeleton: number[][]

		if (leftSide) skeleton = [[0, 2], [2, 4], [0, 6], [6, 8], [8, 10]]
		else skeleton = [[1, 3], [3, 5], [1, 7], [7, 9], [9, 11]]

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		canvas.width = image.naturalWidth
		canvas.height = image.naturalHeight

		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

		ctx.lineWidth = 2
		ctx.strokeStyle = 'white'
		skeleton.forEach(([x, y]) => {
			const pt1 = joints[x]
			const pt2 = joints[y]
			ctx.beginPath()
			ctx.moveTo(pt1[0], pt1[1])
			ctx.lineTo(pt2[0], pt2[1])
			ctx.stroke()
		})

		ctx.fillStyle = 'red'
		joints.forEach(([x, y], index) => {
			if (index % 2 == (leftSide ? 0 : 1)) {
				ctx.beginPath()
				ctx.arc(x, y, 4, 0, 2*Math.PI)
				ctx.fill()
			}
		})
	}

	const calculateAngle = (a: number[], b: number[], c: number[]): number => {
		const ba = [a[0] - b[0], a[1] - b[1]];
		const bc = [c[0] - b[0], c[1] - b[1]];

		const dotProduct = ba[0] * bc[0] + ba[1] * bc[1];
		const normBA = Math.sqrt(ba[0] ** 2 + ba[1] ** 2);
		const normBC = Math.sqrt(bc[0] ** 2 + bc[1] ** 2);

		const cosineAngle = dotProduct / (normBA * normBC + 1e-6);
		const angle = Math.acos(cosineAngle);

		return (angle * 180) / Math.PI;
	}

	const calculateAngles = (leftSide: boolean) => {
		if (!joints) return

		const index = leftSide ? 0 : 1;

		const shoulder = joints[index]
		const elbow = joints[index + 2]
		const wrist = joints[index + 4]
		const hip = joints[index + 6]
		const knee = joints[index + 8]
		const ankle = joints[index + 10]

		const horizontal: number[] = [hip[0] + 100, hip[1]];

		return {
			knee_angle: calculateAngle(hip, knee, ankle),
			hip_angle: calculateAngle(shoulder, hip, knee),
			torso_angle: calculateAngle(horizontal, hip, shoulder),
			shoulder_angle: calculateAngle(elbow, shoulder, hip),
			elbow_angle: calculateAngle(shoulder, elbow, wrist),
		};
	}

	const showAngles = () => {
		if (!joints) return

		const angles = calculateAngles(joints[4][0] < joints[6][0])
		if (!angles) return

		return (
			<ul>
				{Object.entries(angles).map(([name, angle]) => (
					<li key={name}>{name}: {angle}</li>
				))}
			</ul>
		)
	}

	return (
		<div className={`${styles.page} ${openTutorial ? styles.open : ''}`}>
			<section className={styles.main}>
				<h1 className={styles.title}>Get Your BikeFit Today!</h1>
				<p className={styles.description}>
					Let's get started on your BikeFit! You should take a quick
					peek at the <span onClick={() => setOpenTutorial(true)}>tutorial</span> before jumping into it!
				</p>
				<div className={styles.models}>
					<h2>Choose your model</h2>
					<div className={styles.modelButtons}>
						{[...models.entries()].map(([key, name]) => (
							<button
								key={key}
								className={selectedModel === key ? styles.active : ''}
								onClick={() => setSelectedModel(key)}
							>
								{name}
							</button>
						))}
						<span> - </span>
						<button
							className={styles.loadButton}
							onClick={() => loadModelByKey(selectedModel)}
						>
							{loading ?
								'Loading...' :
								Object
									.entries(cachedModels)
									.some(([key]) => (key === selectedModel)) ? 'Loaded' : 'Load the Model'}
						</button>
					</div>
					<div className={styles.cached}>
						<p>These are your loaded and cached models:
							{Object.entries(cachedModels).map(([key], index) => (
								<span key={key}>{index != 0 ? ', ' : ''} {models.get(key)}</span>
							))}
						</p>
					</div>
				</div>
				<section className={styles.uploadSection}>
					<UploadAndCrop onImageCropped={handleCroppedImage}/>
					{imageSrc ?
						<Image
							src={imageSrc}
							width={500}
							height={500}
							alt={'Cropped'}
							className={styles.croppedImage}
						/> :
						<div className={styles.croppedImage} style={{background: 'rgba(30, 30, 30, 0.1)'}}>
							Your cropped and processed image will show here!
						</div>
					}
				</section>
				<section className={styles.predictSection}>
					<h2>Analyze Posture</h2>
					<p>You can now analyze your cycling posture. Please select your preferred model and click on 'Analyze'</p>
					<div className={styles.predict}>
						{Object.entries(cachedModels).at(0) ?
							<select onChange={(value) => loadModelByKey(value.target.value)}>
								{Object.entries(cachedModels).map(([key]) => (
									<option key={key} value={key}>{models.get(key)}</option>
								))}
							</select> :
							<span>You need to load a model first!</span>
						}
						<button
							onClick={predict}
							disabled={!Object.entries(cachedModels).at(0) || !imageSrc}
							className={(!Object.entries(cachedModels).at(0)  || !imageSrc) ? styles.disabled : ''}
						>
							Analyze
						</button>
					</div>
					<div className={styles.resultWrapper}>
						<canvas className={styles.canvas} ref={canvasRef}/>
						{joints && showAngles()}
					</div>
				</section>
			</section>
			{openTutorial && <section className={styles.rightModal}>
        <Image
          src={'/icons/cross.svg'}
          width={24}
					height={24}
					alt={'Close Tutorial'}
					className={styles.cross}
					onClick={() => {
						setOpenTutorial(false)
					}}
				/>
				<h2>How to get started!</h2>
				<div>
					<h3>Model Selection</h3>
					<p>You can choose between these models:</p>
					<ul>
						<li>Large ResNet</li>
						<li>Light Basic</li>
						<li>MoveNet Thunder (heavy but accurate)</li>
						<li>MoveNet Lightning (light and fast)</li>
					</ul>
				</div>
				<div>
					<h3>Picture Upload</h3>
					<p>We need a picture of you with these conditions:</p>
					<ul>
						<li>The foot facing the camera has to be at the top stroke.</li>
						<li>Picture needs to be taken at the same level as the subject.</li>
						<li>The entire subject needs to be in the frame.</li>
					</ul>
					<p>Look at the example picture under as a guide!</p>
				</div>
				<Image
					src={"/images/example-topstroke.webp"}
					width={1000}
					height={750}
					alt={'Example gone'}
					className={styles.examplePicture}
				/>
			</section>}
			{!openTutorial && <div
				className={styles.openTutorial}
				onClick={() => setOpenTutorial(true)}
			>Open Tutorial</div>}
		</div>
	);
}
