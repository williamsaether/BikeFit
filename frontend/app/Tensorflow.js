import UserImage from '../components/ImageUpload'

const tf = require('@tensorflow/tfjs')

async function loadModel() {
    const modelUrl = ' https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/basic/model-tRzd9NvAHbHg0xoCNAB9GaawLu1gWi.json'
    const model = await tf.loadGraphModel(modelUrl)
    console.log('Model loaded')
}
loadModel()