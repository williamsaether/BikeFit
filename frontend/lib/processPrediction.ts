import * as tf from '@tensorflow/tfjs'

export async function extractJoints(predictions: tf.Tensor4D, inputRes = 256, outputRes = 64) {
  const shape = predictions.shape;

  if (shape.length === 4 && shape[1] === shape[2]) {
    // custom heatmap model
    predictions = predictions.squeeze()
    const numJoints = predictions.shape[2]
    const coords = [];

    for (let i = 0; i < numJoints; i++) {
      const heatmap = predictions.slice([0, 0, i], [outputRes, outputRes, 1]).squeeze();

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
  } else {
    // MoveNet model (directly predicts joints)
    const data = await predictions.array() as number [][][][]
    const joints = data[0][0]
    return joints.map(([x, y]) => [y, x])
  }
}