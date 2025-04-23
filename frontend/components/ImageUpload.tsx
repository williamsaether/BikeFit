import React, {useCallback, useState} from 'react';
import * as tf from '@tensorflow/tfjs'
import {preprocessImage} from "@/lib/preprocessImage";
import {useModelContext} from "@/context/ModelContext";
import Cropper from "react-easy-crop";
import {useDropzone} from "react-dropzone";
import {Button, Slider} from "@mui/material";
import getCroppedImage from "@/lib/utils";
import styles from './ImageUpload.module.css'

interface Props {
	onImageCropped: (blob: Blob) => void;
}

export default function UploadAndCrop({ onImageCropped }: Props) {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({x: 0, y: 0});
	const [zoom, setZoom] = useState(1);
	const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const uploaded = acceptedFiles[0]
		const reader = new FileReader()
		reader.onload = () => {
			setImageSrc(reader.result as string)
		}
		reader.readAsDataURL(uploaded)
	}, [])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { 'image/*': [] },
		multiple: false,
	});

	const onCropComplete = useCallback((_: any, croppedPixels: any) => {
		setCroppedAreaPixels(croppedPixels)
	}, [])

	const handleCrop = useCallback(async() => {
		if (!imageSrc || !croppedAreaPixels) return
		const cropped = await getCroppedImage(imageSrc, croppedAreaPixels)
		onImageCropped(cropped)
		setImageSrc(null)
	}, [imageSrc, croppedAreaPixels])

	return (
		<div className={styles.imagePrep}>
			{!imageSrc ?
				<div className={styles.dragAndDrop} {...getRootProps()}>
					<input {...getInputProps()} />
					{isDragActive ? (
						<p>Drop the image here...</p>
					) : (
						<p>Drag & drop an image, or click to select</p>
					)}
				</div> :
				<div className={styles.cropperAndSlider}>
					<div className={styles.cropper}>
						<Cropper
							image={imageSrc}
							crop={crop}
							zoom={zoom}
							aspect={1}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={onCropComplete}
						/>
					</div>
					<p>Crop the image so the cyclist fills the frame and is centered.</p>
					<div className={styles.bottom}>
						<Slider
							value={zoom}
							min={1}
							max={5}
							step={.1}
							onChange={(_, x) => setZoom(x)}
						/>
						<Button onClick={handleCrop} variant='contained' color='primary'>Crop</Button>
					</div>
				</div>
			}
		</div>
	);
}
