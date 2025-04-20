'use client';
import Bikefit from './Bikefit'
import UserImage from '../components/ImageUpload'
import React, { useState } from 'react';


export default function Main() {
  const [startBikefit, setStartBikefit] = useState(false);

  const handleStart = () => setStartBikefit(true);

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
      )
      :   <>
             <Bikefit />
            <UserImage />
          </>
          }

    </div>
  );
}
