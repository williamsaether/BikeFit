'use client';

import React, {use, useCallback, useRef, useState} from 'react';
import {useModelContext} from "@/context/ModelContext";
import * as tf from "@tensorflow/tfjs";
import {preprocessImage} from "@/lib/preprocessImage";
import {extractJoints} from "@/lib/processPrediction";
import UploadAndCrop from "../components/ImageUpload";

export default function Main() {
	const { model, loading, loadModelByKey, currentModelKey } = useModelContext()
	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const [startBikefit, setStartBikefit] = useState(false);
	const canvasRef = useRef(null)

	const handleStart = () => setStartBikefit(true)

	const handleCroppedImage = async (blob: Blob) => {
		setImageSrc(URL.createObjectURL(blob))
	}

	const predict = () => {
		if (!imageSrc || !model) return
		const img = new Image()
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
		<div>
			{!startBikefit ?
				<>
					<h1>Hello</h1>
					<p>This is a blablabla...</p>
					<button
						onClick={handleStart}
					>
						Start Bikefit
					</button>
				</> :
				<>
					{/*<Bikefit />*/}
					<button onClick={() => loadModelByKey('default')}>{loading ? 'Loading...' : 'Load Model'}</button>
					<button onClick={() => loadModelByKey('light')}>{loading ? 'Loading...' : 'Load Light Model'}</button>
					<button onClick={() => loadModelByKey('movenet_thunder')}>{loading ? 'Loading...' : 'Load MoveNet Thunder Model'}</button>
					<button onClick={() => loadModelByKey('movenet_lightning')}>{loading ? 'Loading...' : 'Load MoveNet Lightning Model'}</button>
					<UploadAndCrop onImageCropped={handleCroppedImage} />
					{imageSrc && <img src={imageSrc}  alt={'Cropped'}/>}
					<button onClick={predict}>Predict</button>
					<canvas ref={canvasRef}/>
				</>
			}
		</div>
	);
}
