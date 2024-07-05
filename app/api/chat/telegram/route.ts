import crypto from "crypto"
import axios from "axios"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || "https://writingmate.ai"
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || "ChatLabs"

// In-memory user credit storage (replace with a database in production)
const userCredits: { [key: string]: number } = {}

const fetchOpenRouterModels = async () => {
  try {
    const response = await axios.get("https://openrouter.ai/api/v1/models")

    return response.data.data
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error)
    return []
  }
}

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

export async function POST(req: Request) {
  const { telegramInitData, model, messages, userId } = await req.json()

  console.log("Telegram Web App data:", telegramInitData)

  // Validate Telegram Web App data
  if (!validateTelegramWebAppData(telegramInitData)) {
    return Response.json(
      { error: "Invalid Telegram Web App data" },
      {
        status: 400
      }
    )
  }

  const models = await fetchOpenRouterModels()

  console.log("OpenRouter models:", models)

  const foundModel = models.find((m: any) => m.id === model)

  if (!foundModel) {
    return Response.json(
      { error: "Invalid model" },
      {
        status: 400
      }
    )
  }

  // Check user credits (replace with database lookup in production)
  if (
    (foundModel.pricing.prompt > 0 || foundModel.pricing.completion > 0) &&
    userCredits?.[userId] <= 0
  ) {
    return Response.json(
      { error: "Insufficient credits" },
      {
        status: 402
      }
    )
  }

  console.log(
    "Calling OpenRouter API with model:",
    model,
    messages,
    OPENROUTER_API_KEY
  )

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

    return Response.json(response.data)
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    return Response.json(
      { error: "Error processing your request" },
      {
        status: 500
      }
    )
  }
}
