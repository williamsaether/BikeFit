import * as tf from '@tensorflow/tfjs'

export function preprocessImage(tensor: tf.Tensor3D, size: number, useInt: boolean = false) {
  tensor = tf.image.resizeBilinear(tensor, [size, size]);
  tensor = useInt ? tensor.toInt() : tensor.div(255.0);
  return tensor.expandDims(0);
}