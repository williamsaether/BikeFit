import * as tf from '@tensorflow/tfjs'

export async function extractJoints(heatmaps: tf.Tensor3D, inputRes = 256, outputRes = 64) {
  const numJoints = heatmaps.shape[2];
  const coords = [];

  for (let i = 0; i < numJoints; i++) {
    const heatmap = heatmaps.slice([0, 0, i], [outputRes, outputRes, 1]).squeeze(); // [64, 64]

    const flat = heatmap.flatten();
    const { indices } = tf.topk(flat, 1);
    const index = (await indices.data())[0];

    const y = Math.floor(index / outputRes);
    const x = index % outputRes;

    coords.push([
      x * (inputRes / outputRes),
      y * (inputRes / outputRes)
    ]);
  }
  return coords
}