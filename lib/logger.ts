import pino from "pino"
import pretty from "pino-pretty"

export const logger = pino(
  {
    level: process.env.NODE_ENV === "development" ? "debug" : "info"
  },
  pretty()
)
