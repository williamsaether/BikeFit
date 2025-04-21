const createImage = (url: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const img = new Image()
		img.addEventListener('load', () => resolve(img))
		img.addEventListener('error', (error) => reject(error))
		img.src = url
	})

export default async function getCroppedImage(imageSrc: string, pixelCrop: any): Promise<Blob> {
	const image = await createImage(imageSrc)
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')

	canvas.width = pixelCrop.width
	canvas.height = pixelCrop.height

	if (!ctx) throw new Error("Couldn't load the canvas")

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	)

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) throw new Error(`Blob not found`)
			resolve(blob)
		}, 'image/jpeg')
	})
}