'use client';
import Bikefit from './Bikefit'
import UserImage from '../components/ImageUpload'
import React, {useCallback, useRef, useState} from 'react';
import {useModelContext} from "@/context/ModelContext";
import * as tf from "@tensorflow/tfjs";
import {preprocessImage} from "@/lib/preprocessImage";
import Dropzone, {useDropzone} from 'react-dropzone';
import accept from "attr-accept";
import {image} from "@tensorflow/tfjs";
import {extractJoints} from "@/lib/processPrediction";


export default function Main() {
  const { model, loading, loadModelByKey, currentModelKey } = useModelContext()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [startBikefit, setStartBikefit] = useState(false);
  const canvasRef = useRef(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploaded = acceptedFiles[0]
    if (uploaded) {
      setFile(uploaded)
      setPreviewUrl(URL.createObjectURL(uploaded))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleStart = () => setStartBikefit(true);

  const handleImageChange = () => {
    if (!file || !model) {
      console.log(file)
      console.log(model)
      return
    }
    const img = new Image();
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const tensor = tf.browser.fromPixels(img)
      const { image, pad, scale } = preprocessImage(tensor, 256)
      const pred = model.predict(image) as tf.Tensor4D
      const heatmaps = pred.squeeze() as tf.Tensor3D
      console.log(pred)
      canvasRef.current && plotJoints(canvasRef.current, img, heatmaps)
    };
  };

  const plotJoints = async (canvas: HTMLCanvasElement, image: HTMLImageElement, predictions: tf.Tensor3D) => {
    const coords = await extractJoints(predictions)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'red'
    coords.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2*Math.PI)
      ctx.fill()
    })
  }

  return (
    <div>
      {!startBikefit ? (
        <>
          <h1>Hello</h1>
          <p>This is a blablabla...</p>
          <button
            onClick={handleStart}
          >
            Start Bikefit
          </button>
        </>
      ) :
        <>
          <Bikefit />
          <button onClick={() => loadModelByKey('default')}>{loading ? 'Loading...' : 'Load Model'}</button>
          <div
            {...getRootProps()}
            style={{
              border: '2px dashed gray',
              padding: '2rem',
              marginBottom: '1rem',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the image here...</p>
            ) : (
              <p>Drag & drop an image, or click to select</p>
            )}
          </div>
          <button onClick={handleImageChange}>Predict</button>

          <canvas
            ref={canvasRef}
            width={256}
            height={256}
          />
          </>
          }

    </div>
  );
}
