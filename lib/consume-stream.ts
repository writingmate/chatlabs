import { JSONValue } from "ai"

export async function consumeReadableStream(
  stream: ReadableStream<Uint8Array>,
  callback: (chunk: string) => void,
  signal: AbortSignal
): Promise<void> {
  // Check if the stream is already locked
  if (stream.locked) {
    throw new Error("Stream is already locked")
  }

  const reader = stream.getReader()
  const decoder = new TextDecoder()

  signal.addEventListener(
    "abort",
    () => {
      try {
        reader.cancel()
      } catch (error) {
        console.error("Error canceling stream reader:", error)
      }
    },
    { once: true }
  )

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      if (value) {
        callback(decoder.decode(value, { stream: true }))
      }
    }
  } catch (error) {
    if (signal.aborted) {
      console.error("Stream reading was aborted:", error)
    } else {
      console.error("Error consuming stream:", error)
    }
  } finally {
    reader.releaseLock()
  }
}

export function parseDataStream(line: string): { text: string; data: any } {
  // regex to parse message like this '0: "text", 1: "text"'

  const firstSeparatorIndex = line.indexOf(":")

  if (firstSeparatorIndex === -1) {
    throw new Error("Failed to parse stream string. No separator found.")
  }

  const prefix = line.slice(0, firstSeparatorIndex)

  const streamPartsByCode = {
    "0": {
      parse: (jsonValue: JSONValue) => {
        return { text: jsonValue as string, data: null }
      }
    },
    "7": {
      parse: (jsonValue: JSONValue) => {
        return { data: jsonValue as any, text: "" }
      }
    },
    "8": {
      parse: (jsonValue: JSONValue) => {
        return { data: jsonValue as any, text: "" }
      }
    }
  }

  if (
    !Object.keys(streamPartsByCode).includes(
      prefix as keyof typeof streamPartsByCode
    )
  ) {
    throw new Error(`Failed to parse stream string. Invalid code ${prefix}.`)
  }

  const code = prefix as keyof typeof streamPartsByCode

  const textValue = line.slice(firstSeparatorIndex + 1)
  const jsonValue: JSONValue = JSON.parse(textValue)

  return streamPartsByCode[code].parse(jsonValue)
}
