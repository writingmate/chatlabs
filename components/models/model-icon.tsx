import { FC, HTMLAttributes } from "react"
import Image from "next/image"
import cohere from "@/public/providers/cohere.png"
import databricks from "@/public/providers/databricks.png"
import groq from "@/public/providers/groq.png"
import meta from "@/public/providers/meta.png"
import mistral from "@/public/providers/mistral.png"
import perplexity from "@/public/providers/perplexity.png"
import { ModelProvider } from "@/types"
import { IconSparkles } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { Chat } from "openai/resources/index.mjs"

import { cn } from "@/lib/utils"
import { MicrosoftSVG } from "@/components/icons/microsoft-svg"

import { AnthropicSVG } from "../icons/anthropic-svg"
import { ChatbotUISVG } from "../icons/chatbotui-svg"
import { GoogleSVG } from "../icons/google-svg"
import { OpenAISVG } from "../icons/openai-svg"

interface ModelIconProps extends HTMLAttributes<HTMLDivElement> {
  provider: ModelProvider
  modelId?: string
  height: number
  width: number
}

export const ModelIcon: FC<ModelIconProps> = ({
  provider,
  height,
  width,
  modelId,
  className,
  ...props
}) => {
  const { theme } = useTheme()

  switch (provider as ModelProvider) {
    case "openai":
      return (
        <OpenAISVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border"
          )}
          width={width}
          height={height}
        />
      )
    case "cohere":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={cohere.src}
          alt="Cohere"
          width={width}
          height={height}
        />
      )
    // @ts-ignore
    case "mistralai":
    case "mistral":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={mistral.src}
          alt="Mistral"
          width={width}
          height={height}
        />
      )
    case "groq":
      return (
        <Image
          className={cn(
            "rounded-sm p-0",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={groq.src}
          alt="Groq"
          width={width}
          height={height}
        />
      )
    case "anthropic":
      return (
        <AnthropicSVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border"
          )}
          width={width}
          height={height}
        />
      )
    case "google":
      return (
        <GoogleSVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border"
          )}
          width={width}
          height={height}
        />
      )
    case "perplexity":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={perplexity.src}
          alt="Mistral"
          width={width}
          height={height}
        />
      )
    case "databricks":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={databricks.src}
          alt="Databricks"
          width={width}
          height={height}
        />
      )
    // @ts-ignore
    case "google ai studio":
    // @ts-ignore
    case "azure":
    case "microsoft":
      return (
        <MicrosoftSVG
          className={cn(
            "rounded-sm bg-white p-1 text-black",
            className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border"
          )}
          width={width}
          height={height}
        />
      )
    // @ts-ignore
    case "meta-llama":
    case "meta":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border",
            className
          )}
          src={meta.src}
          alt="Meta Llama"
          width={width}
          height={height}
        />
      )
    case "openrouter":
      console.log("modelId", modelId)
      const newProvider = modelId?.split("/")[0]
      console.log("newProvider", newProvider)
      return (
        <ModelIcon
          className={className}
          provider={newProvider as ModelProvider}
          height={height}
          width={width}
        />
      )
    default:
      return (
        <ChatbotUISVG
          className={cn(
            "border-background/10 dark:border-foreground/10 rounded-sm border invert dark:invert-0",
            className
          )}
          size={width}
        />
      )
  }
}
