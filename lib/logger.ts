const isServer = typeof window === "undefined"
const isNextEdgeRuntime = process.env.NEXT_RUNTIME === "edge"
const isDevelopment = process.env.NODE_ENV === "development"

type LogFn = {
  (obj: Object, msg?: string): void
  (msg: string, obj?: Object): void
}

interface Logger {
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
  fatal: LogFn
}

// Helper to normalize arguments order
const normalizeArgs = (first: string | Object, second?: string | Object) => {
  if (typeof first === "string") {
    return { msg: first, obj: second || {} }
  }
  return { msg: second as string, obj: first }
}

// Simple logger for client-side and edge runtime
const simpleLogger: Logger = {
  debug: (first: string | Object, second?: string | Object) => {
    if (!isDevelopment) return
    const { msg, obj } = normalizeArgs(first, second)
    console.log(JSON.stringify({ ...obj, msg, level: "debug" }))
  },
  info: (first: string | Object, second?: string | Object) => {
    const { msg, obj } = normalizeArgs(first, second)
    console.log(JSON.stringify({ ...obj, msg, level: "info" }))
  },
  warn: (first: string | Object, second?: string | Object) => {
    const { msg, obj } = normalizeArgs(first, second)
    console.warn(JSON.stringify({ ...obj, msg, level: "warn" }))
  },
  error: (first: string | Object, second?: string | Object) => {
    const { msg, obj } = normalizeArgs(first, second)
    console.error(JSON.stringify({ ...obj, msg, level: "error" }))
  },
  fatal: (first: string | Object, second?: string | Object) => {
    const { msg, obj } = normalizeArgs(first, second)
    console.error(JSON.stringify({ ...obj, msg, level: "fatal" }))
  }
}

// Only use pino in server environment (not edge runtime)
let logger: Logger = simpleLogger

if (isServer && !isNextEdgeRuntime) {
  try {
    const pino = require("pino")
    const pinoLogger = pino({
      level: isDevelopment ? "debug" : "info",
      transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
              colorize: true
            }
          }
        : undefined
    })

    // Wrap pino logger to handle both argument orders
    logger = {
      debug: (first: string | Object, second?: string | Object) => {
        const { msg, obj } = normalizeArgs(first, second)
        pinoLogger.debug(obj, msg)
      },
      info: (first: string | Object, second?: string | Object) => {
        const { msg, obj } = normalizeArgs(first, second)
        pinoLogger.info(obj, msg)
      },
      warn: (first: string | Object, second?: string | Object) => {
        const { msg, obj } = normalizeArgs(first, second)
        pinoLogger.warn(obj, msg)
      },
      error: (first: string | Object, second?: string | Object) => {
        const { msg, obj } = normalizeArgs(first, second)
        pinoLogger.error(obj, msg)
      },
      fatal: (first: string | Object, second?: string | Object) => {
        const { msg, obj } = normalizeArgs(first, second)
        pinoLogger.fatal(obj, msg)
      }
    }
  } catch (e) {
    console.warn(
      "Failed to initialize pino logger, falling back to simple logger"
    )
  }
}

export { logger }
