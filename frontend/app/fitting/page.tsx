'use client';

import exampleImage from '../public/examplepic.jpg'
import React, {use, useCallback, useRef, useState} from 'react';
import {useModelContext} from "@/context/ModelContext";
import * as tf from "@tensorflow/tfjs";
import {preprocessImage} from "@/lib/preprocessImage";
import {extractJoints} from "@/lib/processPrediction";
import UploadAndCrop from "@/components/ImageUpload";
import styles from './page.module.css'
import Image from "next/image";

export default function Main() {
	const { model, loading, loadModelByKey, currentModelKey } = useModelContext()
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const [openTutorial, setOpenTutorial] = useState(true)

	const canvasRef = useRef(null)

	const handleCroppedImage = async (blob: Blob) => {
		setImageSrc(URL.createObjectURL(blob))
	}

	const predict = () => {
		if (!imageSrc || !model) return
		const img = new HTMLImageElement()
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

	return (
		<div className={styles.page}>
			<h1>Get Your BikeFit Today!</h1>
			<p></p>
			<div className={`${styles.tutorial} ${openTutorial ? styles.open : ''}`}>
				<div className={styles.tutDropdown} onClick={() => setOpenTutorial(!openTutorial)}>
					<p>Tutorial</p>
					<Image
						src={'/icons/chevdown.svg'}
						width={32}
						height={32}
						alt={'Chevron Down'}
						style={{transform: `rotate(${openTutorial ? 180 : 0}deg)`}}
					/>
				</div>
				{openTutorial && <div className={styles.tutContent}>
					<div>
						<h2>Model Selection</h2>
						<p>You can choose between these models:</p>
						<ul>
							<li>Large ResNet</li>
							<li>Light Basic</li>
							<li>MoveNet Thunder (heavy but accurate)</li>
							<li>MoveNet Lightning (light and fast)</li>
						</ul>
					</div>
					<div>
						<h2>Picture Upload</h2>
						<p>We need a picture of you with these conditions:</p>
						<ul>
							<li>The foot facing the camera has to be at the top stroke.</li>
							<li>Picture needs to be taken at the same level as the subject.</li>
							<li>The entire subject needs to be in the frame.</li>
						</ul>
						<p>Look at the example picture to the right for an example!</p>
					</div>
          <Image
            src={"/images/example-topstroke.webp"}
            width={1000}
            height={750}
            alt={'Example gone'}
          />
				</div>}
				<section className={styles.section}>
					<div>
						<button onClick={() => loadModelByKey('default')}>{loading ? 'Loading...' : 'Load Model'}</button>
						<button onClick={() => loadModelByKey('light')}>{loading ? 'Loading...' : 'Load Light Model'}</button>
						<button onClick={() => loadModelByKey('movenet_thunder')}>{loading ? 'Loading...' : 'Load MoveNet Thunder Model'}</button>
						<button
							onClick={() => loadModelByKey('movenet_lightning')}>{loading ? 'Loading...' : 'Load MoveNet Lightning Model'}</button>
					</div>
					<div>
						<UploadAndCrop onImageCropped={handleCroppedImage}/>
						{imageSrc && <img src={imageSrc} alt={'Cropped'} className={styles.croppedImage}/>}
					</div>
				</section>
				<div className={styles.loadModeltxt}>
					<p>Here you can choose between the model</p>
				</div>
				<div className={styles.loadModelsBtn}>

				</div>
			</div>
			<div className={styles.imageHandeling}>
				<div className={styles.imagePrep}>

				</div>
				<div>
					<button onClick={predict}>Predict</button>
				</div>
				<canvas className={styles.canvas} ref={canvasRef} />
			</div>
		</div>
	);
}
