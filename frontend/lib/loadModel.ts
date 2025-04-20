// loadModel.ts

import * as tf from '@tensorflow/tfjs';

export const loadModel = async () => {
  try {
    // URL of the model's JSON file
    const modelUrl = 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/resnet/model-pSLdLZjgPMzxCqgyi3iE0fEjNs58yZ.json';

    // Load the model from the URL
    const model = await tf.loadLayersModel(modelUrl);
    console.log("Model loaded successfully!");
    return model;
  } catch (error) {
    console.error("Error loading the model:", error);
    throw error;
  }
};
