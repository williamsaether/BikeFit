'use client';

import React, { useState } from 'react';

export default function UserImage() {
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvasSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        const scale = Math.min(canvasSize / img.width, canvasSize / img.height);
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        const offsetX = (canvasSize - newWidth) / 2;
        const offsetY = (canvasSize - newHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

        const dataUrl = canvas.toDataURL();
        setFinalImage(dataUrl);
      };

      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {finalImage && (
        <div>
          <h3>Her er bilde du har valgt i riktig størrelse</h3>
          <img src={finalImage} alt="Formatted" width={256} height={256} />
        </div>
      )}
    </div>
  );
}
