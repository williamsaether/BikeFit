import * as tf from '@tensorflow/tfjs'

export function preprocessImage(image: tf.Tensor3D, size: number) {
  image = tf.reverse(image, -1) // convert to BGR
  const [origHeight, origWidth] = image.shape.slice(0,2)
  const scale = size / Math.max(origWidth, origHeight)

  const newWidth = Math.round(origWidth * scale)
  const newHeight = Math.round(origHeight * scale)

  const resized = tf.image.resizeBilinear(image, [newHeight, newWidth], true)

  const padX = size - newWidth
  const padY = size - newHeight

  const padLeft = Math.floor(padX / 2)
  const padRight = padX - padLeft
  const padTop = Math.floor(padY / 2)
  const padBottom = padY - padTop

  const padded = tf.pad3d(resized, [[padTop, padBottom], [padLeft, padRight], [0, 0]])

  return {
    image: padded.div(255).expandDims(0),
    pad: {padTop, padBottom, padLeft, padRight},
    scale: scale,
  }
}