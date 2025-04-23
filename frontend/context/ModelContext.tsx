'use client'

import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'

await tf.ready() // TODO - show a different screen when loading TensorFlow ??
const backends = tf.engine().registry;
if (!backends['webgl']) {
	console.warn('WebGL backend not available, falling back to CPU.');
	await tf.setBackend('cpu');
} else {
	await tf.setBackend('webgl');
}

type SupportedModel = tf.LayersModel | tf.GraphModel

type ModelContextType = {
	model: SupportedModel | null;
	loading: boolean;
	currentModelKey: string | null;
	loadModelByKey: (key: string) => Promise<void>;
	cachedModels: Record<string, SupportedModel>;
}

const modelURLs: Record<string, string> = {
	default: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/resnet/model.json',
	light: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/basic/model.json',
	movenet_lightning: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/movenet_lightning/model.json',
	movenet_thunder: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/movenet_thunder/model.json',
}

const modelCache: Record<string, SupportedModel> = {}

const ModelContext = createContext<ModelContextType>({
	model: null,
	loading: false,
	currentModelKey: null,
	loadModelByKey: async () => {},
	cachedModels: {},
})

export function ModelProvider({children}: {children: ReactNode}) {
	const [model, setModel] = useState<SupportedModel | null>(null)
	const [loading, setLoading] = useState(false)
	const [currentModelKey, setCurrentModelKey] = useState<string | null>(null)
	const [cachedModels, setCachedModels] = useState<Record<string, SupportedModel>>({})

	const loadModelByKey = useCallback(async (key: string) => {
		if (!modelURLs[key]) {
			console.warn(`Model key "${key}" not found`);
			return;
		}

		setLoading(true)
		setCurrentModelKey(key)

		if (modelCache[key]) { // in case you want to load a previously loaded model, we cache it
			setModel(modelCache[key])
		} else {
			let loadedModel: SupportedModel | null

			if (key.startsWith('movenet')) loadedModel = await tf.loadGraphModel(modelURLs[key])
			else loadedModel = await tf.loadLayersModel(modelURLs[key])

			modelCache[key] = loadedModel
			setModel(loadedModel)
		}

		setCachedModels(modelCache)

		setLoading(false)
	}, [])

	return (
		<ModelContext.Provider value={{ model, loading, currentModelKey, loadModelByKey, cachedModels}}>
			{children}
		</ModelContext.Provider>
	)
}

export function useModelContext() {
	return useContext(ModelContext)
}