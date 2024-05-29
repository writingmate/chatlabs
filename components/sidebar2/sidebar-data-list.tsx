import { ChatbotUIContext } from "@/context/context"
import { updateAssistant } from "@/db/assistants"
import { updateChat } from "@/db/chats"
import { updateCollection } from "@/db/collections"
import { updateFile } from "@/db/files"
import { updateModel } from "@/db/models"
import { updatePreset } from "@/db/presets"
import { updatePrompt } from "@/db/prompts"
import { updateTool } from "@/db/tools"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType, DataListType } from "@/types"
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Separator } from "../ui/separator"
import { Folder } from "./items/folders/folder-item"
import { VList } from "virtua"

export type RowComponentType = FC<{ item: DataItemType }>

interface SidebarDataListProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  RowComponent: RowComponentType
}

export const SidebarDataList: FC<SidebarDataListProps> = ({
  contentType,
  data,
  folders,
  RowComponent
}) => {
  const {
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setTools,
    setPlatformTools,
    setModels
  } = useContext(ChatbotUIContext)

  const divRef = useRef<HTMLDivElement>(null)

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const getSortedData = (
    data: any,
    dateCategory: "Today" | "Yesterday" | "Previous Week" | "Older" | "Pinned"
  ) => {
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const yesterdayStart = new Date(
      new Date().setDate(todayStart.getDate() - 1)
    )
    const oneWeekAgoStart = new Date(
      new Date().setDate(todayStart.getDate() - 7)
    )

    return data
      .filter((item: any) => {
        const itemDate = new Date(item.updated_at || item.created_at)
        switch (dateCategory) {
          case "Pinned":
            return item.pinned
          case "Today":
            return !item.pinned && itemDate >= todayStart
          case "Yesterday":
            return (
              !item.pinned &&
              itemDate >= yesterdayStart &&
              itemDate < todayStart
            )
          case "Previous Week":
            return (
              !item.pinned &&
              itemDate >= oneWeekAgoStart &&
              itemDate < yesterdayStart
            )
          case "Older":
            return !item.pinned && itemDate < oneWeekAgoStart
          default:
            return true
        }
      })
      .sort(
        (
          a: { updated_at: string; created_at: string },
          b: { updated_at: string; created_at: string }
        ) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      )
  }

  const updateFunctions = {
    chats: updateChat,
    presets: updatePreset,
    prompts: updatePrompt,
    files: updateFile,
    collections: updateCollection,
    assistants: updateAssistant,
    tools: updateTool,
    models: updateModel
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    platformTools: setPlatformTools,
    models: setModels
  }

  const updateFolder = async (itemId: string, folderId: string | null) => {
    const item: any = data.find(item => item.id === itemId)

    if (!item) return null

    const updateFunction = updateFunctions[contentType]
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!updateFunction || !setStateFunction) return

    const updatedItem = await updateFunction(item.id, {
      folder_id: folderId
    })

    setStateFunction((items: any) =>
      items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    )
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const target = e.target as Element

    if (!target.closest("#folder")) {
      const itemId = e.dataTransfer.getData("text/plain")
      updateFolder(itemId, null)
    }

    setIsDragOver(false)
  }

  useEffect(() => {
    if (divRef.current) {
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.clientHeight
      )
    }
  }, [data])

  const dataWithFolders = data.filter(item => item.folder_id)
  const dataWithoutFolders = data.filter(item => item.folder_id === null)

  const getDescription = (contentType: ContentType) => {
    switch (contentType) {
      case "chats":
        return "Your chat history will be displayed here."

      case "prompts":
        return "Prompts are pre-saved text inputs designed to generate specific responses and communicate with AI quicker. Prompts you create will be displayed here."

      case "files":
        return "Upload files to enrich conversations and assistants with context, data analysis, feedback, or customization. Uploaded files will be displayed here."

      case "tools":
        return "Plugins are special add-ons that allow you to do extra things beyond just chatting, such as using up-to-date information from the web or checking the weather by connecting to external services or databases."

      case "assistants":
        return "Assistants are special AI characters instructed to provide information, solve specific problems, simulate conversations or offer creative content based on user queries."

      default:
        return null
    }
  }

  return useMemo(
    () => (
      <div
        className="flex min-h-[400px] w-full flex-1 flex-col"
        onDrop={handleDrop}
      >
        <VList className="mt-2 flex w-full flex-col overflow-auto">
          {data.length === 0 && (
            <div className="flex grow flex-col items-center justify-center">
              <div className="text-centertext-muted-foreground p-3 italic">
                {getDescription(contentType)}
              </div>
            </div>
          )}

          {(dataWithFolders.length > 0 || dataWithoutFolders.length > 0) && (
            <div
              className={`h-full ${
                isOverflowing ? "w-[calc(100%-8px)]" : "w-full"
              } space-y-2 ${isOverflowing ? "mr-2" : ""}`}
            >
              {folders.map(folder => (
                <Folder
                  key={folder.id}
                  folder={folder}
                  onUpdateFolder={updateFolder}
                  contentType={contentType}
                >
                  {dataWithFolders
                    .filter(item => item.folder_id === folder.id)
                    .map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id)}
                      >
                        <RowComponent item={item} />
                      </div>
                    ))}
                </Folder>
              ))}

              {folders.length > 0 && <Separator />}

              {contentType === "chats" ? (
                <>
                  {[
                    "Pinned",
                    "Today",
                    "Yesterday",
                    "Previous Week",
                    "Older"
                  ].map(dateCategory => {
                    const sortedData = getSortedData(
                      dataWithoutFolders,
                      dateCategory as
                        | "Pinned"
                        | "Today"
                        | "Yesterday"
                        | "Previous Week"
                        | "Older"
                    )

                    return (
                      sortedData.length > 0 && (
                        <div className={"pt-2 first:pt-0"} key={dateCategory}>
                          <div className="text-muted-foreground bg-background sticky top-0 w-full pb-1 pl-2 text-sm font-semibold">
                            {dateCategory}
                          </div>
                          <div
                            className={cn(
                              "flex grow flex-col",
                              isDragOver && "bg-accent"
                            )}
                            onDrop={handleDrop}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                          >
                            {sortedData.map((item: any) => (
                              <div
                                key={item.id}
                                draggable
                                onDragStart={e => handleDragStart(e, item.id)}
                              >
                                <RowComponent item={item} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  })}
                </>
              ) : (
                <div
                  className={cn(
                    "flex grow flex-col",
                    isDragOver && "bg-accent"
                  )}
                  onDrop={handleDrop}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                >
                  {dataWithoutFolders.map(item => {
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id)}
                      >
                        <RowComponent item={item} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </VList>

        <div
          className={cn("flex grow", isDragOver && "bg-accent")}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
        />
      </div>
    ),
    [data, folders, contentType, isOverflowing, isDragOver, RowComponent]
  )
}
