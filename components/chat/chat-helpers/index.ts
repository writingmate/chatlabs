import { createChatFiles } from "@/db/chat-files"
import { createChat } from "@/db/chats"
import { createMessageFileItems } from "@/db/message-file-items"
import { createMessages, updateMessage } from "@/db/messages"
import { uploadMessageImage } from "@/db/storage/message-images"
import {
  buildClaudeFinalMessages,
  buildFinalMessages,
  buildGoogleGeminiFinalMessages,
  buildOpenRouterFinalMessages
} from "@/lib/build-prompt"
import { consumeReadableStream, parseDataStream } from "@/lib/consume-stream"
import { Tables, TablesInsert } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatPayload,
  ChatSettings,
  LLM,
  MessageImage
} from "@/types"
import React from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { SubscriptionRequiredError } from "@/lib/errors"
import { validatePlanForModel, validatePlanForTools } from "@/lib/subscription"
import { encode } from "gpt-tokenizer"
import {
  parseChatMessageCodeBlocksAndContent,
  reconstructContentWithCodeBlocks,
  reconstructContentWithCodeBlocksInChatMessage
} from "@/lib/messages"
import { threadId } from "node:worker_threads"
import { useCodeBlockManager } from "@/hooks/useCodeBlockManager"

export const validateChatSettings = (
  chatSettings: ChatSettings | null,
  modelData: LLM | undefined,
  profile: Tables<"profiles"> | null,
  selectedWorkspace: Tables<"workspaces"> | null,
  messageContent: string,
  selectedAssistant: Tables<"assistants"> | null,
  selectedTools: Tables<"tools">[]
) => {
  if (!chatSettings) {
    throw new Error("Chat settings not found")
  }

  if (!modelData) {
    throw new Error("Model not found")
  }

  if (!messageContent) {
    throw new Error("Message content not found")
  }

  if (!validatePlanForModel(profile, modelData.modelId)) {
    const requiredPlan = modelData.tier === "ultimate" ? "Ultimate" : "Pro"
    throw new SubscriptionRequiredError(
      `${requiredPlan} plan required to use this model`
    )
  }

  if (!validatePlanForTools(profile, selectedTools, modelData.modelId)) {
    throw new SubscriptionRequiredError("Subscription required to use tools")
  }
}

export const handleRetrieval = async (
  userInput: string,
  newMessageFiles: ChatFile[],
  chatFiles: ChatFile[],
  embeddingsProvider: "jina" | "openai" | "local",
  sourceCount: number
) => {
  const response = await fetch("/api/retrieval/retrieve", {
    method: "POST",
    body: JSON.stringify({
      userInput,
      fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
      embeddingsProvider,
      sourceCount
    })
  })

  if (!response.ok) {
    console.error("Error retrieving:", response)
  }

  const { results } = (await response.json()) as {
    results: Tables<"file_items">[]
  }

  return results
}

export const createTempMessages = (
  messageContent: string,
  chatMessages: ChatMessage[],
  chatSettings: ChatSettings,
  b64Images: string[],
  isRegeneration: boolean,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  selectedAssistant: Tables<"assistants"> | null,
  userAnnotation: any = {}
) => {
  let tempUserChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: null,
      content: messageContent,
      created_at: "",
      id: uuidv4(),
      image_paths: b64Images,
      model: chatSettings.model,
      role: "user",
      sequence_number: chatMessages.length,
      updated_at: "",
      user_id: "",
      annotation: userAnnotation,
      word_count: 0
    },
    fileItems: []
  }

  let tempAssistantChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: selectedAssistant?.id || null,
      content: "",
      created_at: "",
      id: uuidv4(),
      image_paths: [],
      model: chatSettings.model,
      role: "assistant",
      sequence_number: chatMessages.length + 1,
      updated_at: "",
      user_id: "",
      annotation: {},
      word_count: 0
    },
    fileItems: []
  }

  let newMessages = []

  if (isRegeneration) {
    const lastMessageIndex = chatMessages.length - 1
    chatMessages[lastMessageIndex].message.content = ""
    chatMessages[lastMessageIndex].message.annotation = {}
    newMessages = [...chatMessages]
  } else {
    newMessages = [
      ...chatMessages,
      tempUserChatMessage,
      tempAssistantChatMessage
    ]
  }

  setChatMessages(newMessages.map(parseChatMessageCodeBlocksAndContent))

  return {
    tempUserChatMessage,
    tempAssistantChatMessage
  }
}

export const handleLocalChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  chatSettings: ChatSettings,
  tempAssistantMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  const formattedMessages = await buildFinalMessages(payload, profile, [])

  // Ollama API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
  const response = await fetchChatResponse(
    process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/chat",
    {
      model: chatSettings.model,
      messages: formattedMessages,
      options: {
        temperature: payload.chatSettings.temperature
      }
    },
    false,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantMessage,
    false,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse
  )
}

export const handleToolsChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  tempAssistantChatMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  chatImages: MessageImage[],
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  selectedTools: Tables<"tools">[],
  supportsStreaming = false,
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  setRequestTokensTotal?: React.Dispatch<React.SetStateAction<number>>
) => {
  const startTime = Date.now()

  const { finalMessages: formattedMessages, usedTokens } =
    await buildFinalMessages(payload, profile!, chatImages)

  setRequestTokensTotal?.(usedTokens)

  const response = await fetchChatResponse(
    supportsStreaming ? "/api/chat/tools-stream" : "/api/chat/tools",
    {
      chatSettings: payload.chatSettings,
      messages: formattedMessages,
      selectedTools
    },
    true,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  setToolInUse("none")
  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantChatMessage,
    true,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse,
    selectedTools,
    setResponseTimeToFirstToken,
    setResponseTimeTotal,
    setResponseTokensTotal,
    startTime
  )
}

export const handleHostedChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  modelData: LLM,
  tempAssistantChatMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  newMessageImages: MessageImage[],
  chatImages: MessageImage[],
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  setRequestTokensTotal?: React.Dispatch<React.SetStateAction<number>>
) => {
  const provider =
    modelData.provider === "openai" && profile.use_azure_openai
      ? "azure"
      : modelData.provider

  let formattedMessages = []
  let usedTokens = 0

  if (provider === "google") {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildGoogleGeminiFinalMessages(payload, profile, newMessageImages))
  } else if (provider === "anthropic") {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildClaudeFinalMessages(payload, profile, chatImages))
  } else if (provider === "openrouter") {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildOpenRouterFinalMessages(payload, profile, chatImages))
  } else {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildFinalMessages(payload, profile, chatImages))
  }

  const apiEndpoint =
    provider === "custom" ? "/api/chat/custom" : `/api/chat/${provider}`

  const requestBody = {
    chatSettings: {
      ...payload.chatSettings,
      model: modelData.hostedId || modelData.modelId
    },
    messages: formattedMessages,
    customModelId: provider === "custom" ? modelData.hostedId : ""
  }

  setRequestTokensTotal?.(usedTokens)

  const startTime = Date.now()

  const response = await fetchChatResponse(
    apiEndpoint,
    requestBody,
    true,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantChatMessage,
    true,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse,
    [],
    setResponseTimeToFirstToken,
    setResponseTimeTotal,
    setResponseTokensTotal,
    startTime
  )
}

export const fetchChatResponse = async (
  url: string,
  body: object,
  isHosted: boolean,
  controller: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setPaywallOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  maxRetries = 3,
  retryDelay = 1000
) => {
  let errorMessage = "Error fetching chat response"
  let errorLogLevel = toast.error

  const fetchWithRetry = async (retriesLeft: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        signal: controller.signal
      })

      if (!response.ok) {
        console.error("Error fetching chat response:", response)

        const statusToError = {
          404: { message: "Model not found.", logLevel: toast.error },
          429: {
            message:
              "You are sending too many messages. Please try again in a few minutes.",
            logLevel: toast.warning
          },
          402: {
            message:
              "You have reached the limit of free messages. Please upgrade to a paid plan.",
            logLevel: toast.warning
          },
          413: {
            message:
              "Message is too long or image is too large. Please shorten it.",
            logLevel: toast.error
          }
        }

        const errorInfo =
          statusToError[response.status as keyof typeof statusToError]

        if (errorInfo) {
          errorMessage = errorInfo.message
          errorLogLevel = errorInfo.logLevel
        } else {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } catch {
            errorMessage = "Failed to send the message. Please try again."
          }
        }

        if (response.status === 402) {
          setPaywallOpen?.(true)
        }

        if (response.status === 504 && retriesLeft > 0) {
          console.log("Retrying...", retriesLeft)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return fetchWithRetry(retriesLeft - 1)
        }

        throw new Error(errorMessage)
      }

      return response
    } catch (error: any) {
      if (retriesLeft > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchWithRetry(retriesLeft - 1)
      }
      throw error
    }
  }

  try {
    return await fetchWithRetry(maxRetries)
  } catch (error: any) {
    console.error("Error fetching chat response:", error)
    setIsGenerating(false)
    setChatMessages(prevMessages => prevMessages.slice(0, -2))
    errorLogLevel(error?.message || errorMessage)
    throw error
  }
}

export const processResponse = async (
  response: Response,
  lastChatMessage: ChatMessage,
  isHosted: boolean,
  controller: AbortController,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  selectedTools: Tables<"tools">[] = [],
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  startTime = Date.now()
) => {
  let fullText = ""
  let contentToAdd = ""
  let data: any = null

  let chunks: string[] = []

  if (response.body) {
    try {
      await consumeReadableStream(
        response.body,
        chunk => {
          setResponseTimeToFirstToken?.(prev => {
            if (prev === 0) {
              return (Date.now() - startTime) / 1000
            }
            return prev
          })
          setFirstTokenReceived(true)
          setToolInUse("none")

          try {
            contentToAdd = isHosted
              ? chunk
              : // Ollama's streaming endpoint returns new-line separated JSON
                // objects. A chunk may have more than one of these objects, so we
                // need to split the chunk by new-lines and handle each one
                // separately.
                chunk
                  .trimEnd()
                  .split("\n")
                  .reduce(
                    (acc, line) => acc + JSON.parse(line).message.content,
                    ""
                  )

            if (contentToAdd === "") {
              return
            }

            if (selectedTools.length > 0) {
              chunks.push(contentToAdd)
              if (chunk[chunk.length - 1] !== "\n") {
                return
              }

              const streamParts = chunks
                .join("")
                .split("\n")
                .filter(x => x !== "")
                .map(parseDataStream)
              chunks = []

              for (const { text, data: newData } of streamParts) {
                if (newData) {
                  data = newData
                }
                contentToAdd = text
                fullText += text
              }
            } else {
              fullText += contentToAdd
            }
          } catch (error) {
            console.error("Error parsing JSON:", error)
          }

          setResponseTimeTotal?.(prev => (Date.now() - startTime) / 1000)

          setChatMessages(prev =>
            prev
              .map(chatMessage => {
                if (chatMessage.message.id === lastChatMessage.message.id) {
                  const updatedChatMessage: ChatMessage = {
                    message: {
                      ...chatMessage.message,
                      content: fullText,
                      annotation: data
                    },
                    fileItems: chatMessage.fileItems
                  }

                  return updatedChatMessage
                }

                return chatMessage
              })
              .map(parseChatMessageCodeBlocksAndContent)
          )
        },
        controller.signal
      )

      function findSkipTokenCount(
        data: { [key: string]: { skipTokenCount: boolean } }[]
      ): boolean {
        if (!data) return false

        return data.some(x => {
          for (const key in x) {
            if (x[key].skipTokenCount) {
              return true
            }
          }
        })
      }

      if (setResponseTokensTotal) {
        setResponseTokensTotal(prev => {
          if (!findSkipTokenCount(data)) {
            return prev + encode(fullText).length
          }
          return prev
        })
      }

      return {
        generatedText: fullText,
        data
      }
    } catch (error) {
      console.error("Error processing response:", error)
      toast.error("Something went wrong. Please try again.")
      setChatMessages(prevMessages => prevMessages.slice(0, -2))
      throw error
    }
  } else {
    throw new Error("Response body is null")
  }
}

export const handleCreateChat = async (
  chatSettings: ChatSettings,
  profile: Tables<"profiles">,
  selectedWorkspace: Tables<"workspaces">,
  messageContent: string,
  selectedAssistant: Tables<"assistants">,
  newMessageFiles: ChatFile[],
  selectedTools: Tables<"tools">[],
  setSelectedChat: React.Dispatch<React.SetStateAction<Tables<"chats"> | null>>,
  setChats: React.Dispatch<React.SetStateAction<Tables<"chats">[]>>,
  setChatFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>,
  setSelectedTools: React.Dispatch<React.SetStateAction<Tables<"tools">[]>>
) => {
  const createdChat = await createChat({
    user_id: profile.user_id,
    workspace_id: selectedWorkspace.id,
    assistant_id: selectedAssistant?.id || null,
    context_length: chatSettings.contextLength,
    include_profile_context: chatSettings.includeProfileContext,
    include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
    model: chatSettings.model,
    name: messageContent.substring(0, 100),
    prompt: chatSettings.prompt,
    temperature: chatSettings.temperature,
    embeddings_provider: chatSettings.embeddingsProvider
  })

  await createChatFiles(
    newMessageFiles.map(file => ({
      user_id: profile.user_id,
      chat_id: createdChat.id,
      file_id: file.id
    }))
  )

  setChats(chats => [createdChat, ...chats])
  setSelectedTools(selectedTools)
  setSelectedChat(createdChat)
  setChatFiles(prev => [...prev, ...newMessageFiles])

  return createdChat
}

const handleRegeneration = async (
  chatMessages: ChatMessage[],
  generatedText: string,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): Promise<void> => {
  const lastUserMessageIndex = chatMessages.length - 2
  const lastAssistantMessageIndex = chatMessages.length - 1

  const lastUserMessage = chatMessages[lastUserMessageIndex].message
  const lastAssistantMessage = chatMessages[lastAssistantMessageIndex].message

  // Update the assistant message with the new generated content
  const updatedAssistantMessage = await updateMessage(lastAssistantMessage.id, {
    ...lastAssistantMessage,
    content: generatedText.trim()
  })

  // Update the chat messages state
  const updatedMessages = [...chatMessages]
  updatedMessages[lastAssistantMessageIndex].message = updatedAssistantMessage

  setChatMessages(updatedMessages)
}

const createMessageObject = (
  chatId: string,
  userId: string,
  content: string,
  modelId: string,
  role: string,
  sequenceNumber: number,
  annotation: any = {},
  selectedAssistant: Tables<"assistants"> | null = null
): TablesInsert<"messages"> => ({
  chat_id: chatId,
  assistant_id: selectedAssistant?.id || null,
  user_id: userId,
  content,
  model: modelId,
  role,
  sequence_number: sequenceNumber,
  image_paths: [],
  annotation
})

export const handleCreateMessages = async (
  chatMessages: ChatMessage[],
  currentChat: Tables<"chats">,
  profile: Tables<"profiles">,
  modelData: LLM,
  messageContent: string,
  generatedText: string,
  newMessageImages: MessageImage[],
  isRegeneration: boolean,
  retrievedFileItems: Tables<"file_items">[],
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setChatFileItems: React.Dispatch<
    React.SetStateAction<Tables<"file_items">[]>
  >,
  setChatImages: React.Dispatch<React.SetStateAction<MessageImage[]>>,
  selectedAssistant: Tables<"assistants"> | null,
  userAnnotations: any = {},
  assistantAnnotations: any = {}
): Promise<void> => {
  try {
    if (isRegeneration && generatedText.trim()) {
      // Handle regeneration: update the last two messages
      await handleRegeneration(chatMessages, generatedText, setChatMessages)
      return
    }

    // Identify messages that need to be created
    const notCreatedPriorMessages = chatMessages
      .filter(message => message.message.id === "")
      .map(reconstructContentWithCodeBlocksInChatMessage)

    // Prepare new user and assistant messages
    const newUserMessage = createMessageObject(
      currentChat.id,
      profile.user_id,
      messageContent,
      modelData.modelId,
      "user",
      chatMessages.length,
      userAnnotations,
      selectedAssistant
    )

    const assistantContent = reconstructContentWithCodeBlocks(
      generatedText,
      chatMessages[chatMessages.length - 1]?.codeBlocks || []
    )

    const newAssistantMessage = createMessageObject(
      currentChat.id,
      profile.user_id,
      assistantContent,
      modelData.modelId,
      "assistant",
      chatMessages.length + 1,
      assistantAnnotations,
      selectedAssistant
    )

    // Combine all messages that need to be processed
    const allMessagesToProcess = [
      ...notCreatedPriorMessages.map(msg =>
        createMessageObject(
          currentChat.id,
          profile.user_id,
          msg.message.content,
          modelData.modelId,
          msg.message.role,
          msg.message.sequence_number,
          msg.message.annotation,
          selectedAssistant
        )
      ),
      newUserMessage,
      newAssistantMessage
    ]

    // Persist all messages to the database
    const createdMessages = await createMessages(allMessagesToProcess)

    if (!createdMessages) {
      return
    }

    // Extract the newly created user and assistant messages
    const createdUserMessage = createdMessages[createdMessages.length - 2]
    const createdAssistantMessage = createdMessages[createdMessages.length - 1]

    // Handle image uploads for the user message
    const uploadPromises = newMessageImages.map(obj => {
      const filePath = `${profile.user_id}/${currentChat.id}/${createdUserMessage.id}/${uuidv4()}`
      return uploadMessageImage(filePath, obj.file as File).catch(error => {
        console.error(`Failed to upload image at ${filePath}:`, error)
        return null
      })
    })

    const paths = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[]

    // Update user message with image paths
    await updateMessage(createdUserMessage.id, {
      ...createdUserMessage,
      image_paths: paths
    })

    console.log(
      "paths",
      paths,
      newMessageImages,
      createdUserMessage,
      createdUserMessage.id
    )

    // Update chat images state
    setChatImages(prevImages => [
      ...prevImages,
      ...newMessageImages.map((obj, index) => ({
        ...obj,
        messageId: createdUserMessage.id,
        path: paths[index]
      }))
    ])

    // Create message file items for the assistant message
    await createMessageFileItems(
      retrievedFileItems.map(fileItem => ({
        user_id: profile.user_id,
        message_id: createdAssistantMessage.id,
        file_item_id: fileItem.id
      }))
    )

    // Filter out messages that had no IDs before updating the state
    const filteredChatMessages = chatMessages.filter(
      message => message.message.id !== ""
    )

    // Update chat state with all newly created/updated messages
    const finalChatMessages = [
      ...filteredChatMessages,
      ...createdMessages.map((msg, index) => ({
        message: msg,
        fileItems:
          index === createdMessages.length - 1
            ? retrievedFileItems.map(item => item.id)
            : []
      }))
    ]

    setChatFileItems(prevItems => [
      ...prevItems,
      ...retrievedFileItems.filter(
        item => !prevItems.some(prev => prev.id === item.id)
      )
    ])

    setChatMessages(finalChatMessages.map(parseChatMessageCodeBlocksAndContent))
  } catch (error) {
    console.error("Error in handleCreateMessages:", error)
    throw error
    // Optionally, you could add user-facing error handling here, such as displaying a toast notification
  }
}
