'use client'

import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import * as tf from '@tensorflow/tfjs'

const modelURLs: Record<string, string> = {
	default: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/resnet/model.json',
	light: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/basic/model.json'
}

const modelCache: Record<string, tf.LayersModel> = {}

type ModelContextType = {
	model: tf.LayersModel | null;
	loading: boolean;
	currentModelKey: string | null;
	loadModelByKey: (key: string) => Promise<void>
}

const ModelContext = createContext<ModelContextType>({
	model: null,
	loading: false,
	currentModelKey: null,
	loadModelByKey: async () => {}
})

export function ModelProvider({children}: {children: ReactNode}) {
	const [model, setModel] = useState<tf.LayersModel | null>(null)
	const [loading, setLoading] = useState(false)
	const [currentModelKey, setCurrentModelKey] = useState<string | null>(null)

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
			const loadedModel = await tf.loadLayersModel(modelURLs[key])
			modelCache[key] = loadedModel
			setModel(loadedModel)
		}

		setLoading(false)
	}, [])

	return (
		<ModelContext.Provider value={{ model, loading, currentModelKey, loadModelByKey}}>
			{children}
		</ModelContext.Provider>
	)
}

export function useModelContext() {
	return useContext(ModelContext)
}