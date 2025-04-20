'use client';

import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs'
import {preprocessImage} from "@/lib/preprocessImage";
import {useModelContext} from "@/context/ModelContext";

export default function UserImage() {
  const { model } = useModelContext()



  return (
    <div>
    </div>
  );
}
