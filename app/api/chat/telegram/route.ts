import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"
import axios from "axios"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || "https://writingmate.ai"
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || "ChatLabs"

// In-memory user credit storage (replace with a database in production)
const userCredits: { [key: string]: number } = {}

function validateTelegramWebAppData(telegramInitData: string): boolean {
  const initData = new URLSearchParams(telegramInitData)
  const hash = initData.get("hash")
  initData.delete("hash")
  initData.sort()

  let dataCheckString = ""
  for (const [key, value] of initData.entries()) {
    dataCheckString += `${key}=${value}\n`
  }
  dataCheckString = dataCheckString.slice(0, -1)

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(TELEGRAM_BOT_TOKEN)
  const calculatedHash = crypto
    .createHmac("sha256", secret.digest())
    .update(dataCheckString)
    .digest("hex")

  return calculatedHash === hash
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { telegramInitData, model, messages, userId } = req.body

  // Validate Telegram Web App data
  if (!validateTelegramWebAppData(telegramInitData)) {
    return res.status(401).json({ error: "Invalid authentication" })
  }

  // Check user credits (replace with database lookup in production)
  if (!userCredits[userId] || userCredits[userId] <= 0) {
    return res.status(402).json({ error: "Insufficient credits" })
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": YOUR_SITE_URL,
          "X-Title": YOUR_SITE_NAME,
          "Content-Type": "application/json"
        }
      }
    )

    // Deduct credits (implement proper credit calculation based on token usage)
    userCredits[userId] -= 1

    res.status(200).json(response.data)
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    res.status(500).json({ error: "Error processing your request" })
  }
}
