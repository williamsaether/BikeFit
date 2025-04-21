import React, {useCallback, useState} from 'react';
import * as tf from '@tensorflow/tfjs'
import {preprocessImage} from "@/lib/preprocessImage";
import {useModelContext} from "@/context/ModelContext";
import Cropper from "react-easy-crop";
import {useDropzone} from "react-dropzone";
import {Button, Slider} from "@mui/material";
import getCroppedImage from "@/lib/utils";

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
    <div>
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

      {imageSrc &&
        <div>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />

          <Slider
            value={zoom}
            min={1}
            max={5}
            step={.1}
            onChange={(_, x) => setZoom(x)}
          />
          <Button onClick={handleCrop} variant='contained' color='primary'>Crop</Button>
        </div>
      }
    </div>
  );
}
