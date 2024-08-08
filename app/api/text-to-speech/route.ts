import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json()

    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key!,
      baseURL: process.env.OPENAI_BASE_URL
    })

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice || "alloy",
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
