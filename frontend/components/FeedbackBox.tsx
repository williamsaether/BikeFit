import {forwardRef, useEffect, useImperativeHandle, useState} from "react";
import styles from './FeedbackBox.module.css'

export interface FeedbackBoxRef {
	triggerFeedback: () => void
}

interface FeedbackBoxProps {
	angles: Record<string, number>
	goal: 'comfort' | 'performance'
	issue?: string
}

async function getBikeFitFeedback(angles: Record<string, number>, goal: string, issue?: string) {
	const res = await fetch('/api/feedback', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			angles,
			context: {
				type: 'road',
				position: 'top'
			},
		}),
	})

	const data = await res.json()
	return data.feedback
}

const FeedbackBox = forwardRef<FeedbackBoxRef, FeedbackBoxProps>(({ angles, goal, issue }, ref) => {
	const [feedback, setFeedback] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	const triggerFeedback = async () => {
		setLoading(true)
		setError(null)

		try {
			const res = await getBikeFitFeedback(angles, goal, issue)
			setFeedback(res)
		} catch (err) {
			console.error('Feedback error: ', err)
			setError('Failed to fetch feedback');
		}

		setLoading(false)
	}

	useImperativeHandle(ref, () => ({
		triggerFeedback,
		loading,
	}))

	return (
		<div className={styles.feedback}>
			{loading && <p>Analyzing...</p>}
			{error && <p className={styles.error}>{error}</p>}
			{feedback && (
				<div>
					<strong>Bike Fit Tips:</strong>
					<ul>
						{feedback.split('\n').map((value, index) => (
							<li key={index}>{value}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
})

export default FeedbackBox