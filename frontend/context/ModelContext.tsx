'use client'

import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import * as tf from '@tensorflow/tfjs'

const modelURLs: Record<string, string> = {
	default: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/resnet/model-pSLdLZjgPMzxCqgyi3iE0fEjNs58yZ.json',
	light: 'https://h0n9zbco1ozxhkso.public.blob.vercel-storage.com/models/basic/model-tRzd9NvAHbHg0xoCNAB9GaawLu1gWi.json'
}

const modelCache: Record<string, tf.GraphModel> = {}

type ModelContextType = {
	model: tf.GraphModel | null;
	loading: boolean;
	currentModelKey: string | null;
	loadModelByKey: (key: string) => Promise<void>
}

const ModelContext = createContext<ModelContextType>({
	model: null,
	loading: true,
	currentModelKey: null,
	loadModelByKey: async () => {}
})

export function ModelProvider({children}: {children: ReactNode}) {
	const [model, setModel] = useState<tf.GraphModel | null>(null)
	const [loading, setLoading] = useState(true)
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
			const loadedModel = await tf.loadGraphModel(modelURLs[key])
			modelCache[key] = loadedModel
			setModel(loadedModel)
		}

		setLoading(false)
	}, [])

	useEffect(() => {
		loadModelByKey('default')
	}, [loadModelByKey])

	return (
		<ModelContext.Provider value={{ model, loading, currentModelKey, loadModelByKey}}>
			{children}
		</ModelContext.Provider>
	)
}

export function useModelContext() {
	return useContext(ModelContext)
}