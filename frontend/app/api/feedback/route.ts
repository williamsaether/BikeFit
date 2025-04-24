import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const requestsPerIp = new Map<string, { count: number; lastReset: number }>()
const MAX_REQUESTS = 5
const RESET_INTERVAL = 1000 * 60 * 60 // 1 hour

function isRateLimited(ip: string, devKey?: string): boolean {
	const bypassKey = process.env.BIKEFIT_DEV_KEY
	if (devKey && devKey === bypassKey) return false

	const now = Date.now()
	const record = requestsPerIp.get(ip) || { count: 0, lastReset: now }

	if (now - record.lastReset > RESET_INTERVAL) {
		record.count = 0
		record.lastReset = now
	}

	record.count++
	requestsPerIp.set(ip, record)

	return record.count > MAX_REQUESTS
}

function generatePrompt(
	angles: Record<string, number>,
	context: {type: string, position: string},
	goal: string,
	issue?: string
): string {
	let prompt = `
		You are a professional bike fitting expert.
		
		The cyclist is seeking a fit optimized for **${goal}**.
	
    The following joint angles were measured from a photo of a ${context.type} cyclist at the ${context.position} of the pedal stroke.

		- Knee Angle: ${angles.knee_angle.toFixed(1)}°
		- Hip Angle: ${angles.hip_angle.toFixed(1)}°
		- Torso Angle: ${angles.torso_angle.toFixed(1)}°
		- Shoulder Angle: ${angles.shoulder_angle.toFixed(1)}°
		- Elbow Angle: ${angles.elbow_angle.toFixed(1)}°
		
		These are the recommended ranges:
		- Knee Angle: 105–114°
		- Hip Angle: 60–69°
		- Torso Angle: 42–49°
		- Shoulder Angle: 87–94°
		- Elbow Angle: 150–169°
		
		Use these ranges and the goal context to evaluate whether the rider’s position should be adjusted more toward power and aerodynamics, or comfort and control.
		
		Respond with a maximum of 5 tips. Each tip must follow this strict format:
		
		"Adjustment (in mm or cm if positional): Reason (1 short clause only)"
		
		Examples:
		- Raise saddle by 5 mm: to improve knee extension  
		- Shorten stem by 3 cm: to reduce arm overextension  
		- Rotate handlebars upward slightly: to improve wrist angle  
		
		Use this exact format. Do not use quotes. Do not explain further. No general comments.
	`.trim();

	if (issue) {
		prompt += `\n\nThe rider has reported the following issue: "${issue}". Consider this when suggesting adjustments.`;
	}

	return prompt
}

export async function POST(req: NextRequest) {
	const body = await req.json()
	const { angles, context, goal, issue }: {
		angles: Record<string, number>,
		context: {type: string, position: string},
		goal: string,
		issue?: string
	} = body
	const devKey = req.headers.get('x-bf-key') ?? ''
	const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

	if (isRateLimited(ip, devKey)) {
		return NextResponse.json(
			{ message: 'Too many requests - wait a bit and try again.'},
			{ status: 429 }
		)
	}

	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [{ role: 'user', content: generatePrompt(angles,context,goal,issue) }]
		})

		const feedback = completion.choices[0].message.content;
		return NextResponse.json({ feedback });
	} catch (err) {
		return NextResponse.json({ message: 'Error generating feedback', err }, { status: 500 })
	}
}
