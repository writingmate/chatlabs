import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text
    })

    // Convert the response to a ReadableStream
    const stream = mp3.body as unknown as ReadableStream

    // Return the audio stream
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    })
  } catch (error) {
    console.error("Error in text-to-speech API:", error)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    )
  }
}
