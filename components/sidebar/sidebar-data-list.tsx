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
import {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from "react"
import { Separator } from "../ui/separator"
import { AssistantItem } from "./items/assistants/assistant-item"
import { ChatItem } from "./items/chat/chat-item"
import { CollectionItem } from "./items/collections/collection-item"
import { FileItem } from "./items/files/file-item"
import { Folder } from "./items/folders/folder-item"
import { ModelItem } from "./items/models/model-item"
import { PresetItem } from "./items/presets/preset-item"
import { PromptItem } from "./items/prompts/prompt-item"
import { ToolItem } from "./items/tools/tool-item"
import { Virtualizer, VList, VListHandle } from "virtua"
import { EmptyState } from "./empty-state"
import { useScrollBase } from "../chat/chat-hooks/use-scroll"

interface SidebarDataListProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
  onLoadMore?: () => Promise<void> // Make onLoadMore optional
}

export const SidebarDataList: FC<SidebarDataListProps> = ({
  contentType,
  data,
  folders,
  onLoadMore
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

  const vlistRef = useRef<VListHandle>(null)

  const DataListComponent = ({
    contentType,
    item
  }: {
    contentType: ContentType
    item: DataItemType
  }) => {
    switch (contentType) {
      case "chats":
        return <ChatItem key={item.id} chat={item as Tables<"chats">} />

      case "presets":
        return <PresetItem key={item.id} preset={item as Tables<"presets">} />

      case "prompts":
        return (
          <PromptItem
            key={item.id}
            prompt={item as Tables<"prompts">}
            setPrompts={setPrompts}
          />
        )

      case "files":
        return <FileItem key={item.id} file={item as Tables<"files">} />

      case "collections":
        return (
          <CollectionItem
            key={item.id}
            collection={item as Tables<"collections">}
          />
        )

      case "assistants":
        return (
          <AssistantItem
            key={item.id}
            assistant={item as Tables<"assistants">}
          />
        )

      case "tools":
        return <ToolItem key={item.id} tool={item as Tables<"tools">} />

      case "models":
        return <ModelItem key={item.id} model={item as Tables<"models">} />

      default:
        return null
    }
  }

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

  const [loadingMore, setLoadingMore] = useState(false)

  const { scrollRef, handleScroll, isAtBottom } = useScrollBase()

  useEffect(() => {
    if (isAtBottom && !loadingMore) {
      setLoadingMore(true)
      onLoadMore?.().finally(() => setLoadingMore(false))
    }
  }, [isAtBottom, onLoadMore, loadingMore])

  useEffect(() => {
    if (divRef.current) {
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.clientHeight
      )
    }
  }, [data])

  function sortByPinned(a: any, b: any) {
    if ("pinned" in a && "pinned" in b) {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
    }
    return 0
  }

  // sort pinned items first if .pinned property is available
  const dataWithFolders = data.filter(item => item.folder_id).sort(sortByPinned)
  const dataWithoutFolders = data
    .filter(item => item.folder_id === null)
    .sort(sortByPinned)

  const getDescription = (contentType: ContentType) => {
    switch (contentType) {
      case "chats":
        return (
          <EmptyState
            message="No chats yet"
            description="Chats are conversations with AI characters. You can create a chat by clicking the 'New chat' button."
          />
        )

      case "prompts":
        return (
          <EmptyState
            message="No prompts yet"
            description="Prompts are pre-saved text inputs designed to generate specific responses and communicate with AI quicker. Prompts you create will be displayed here."
          />
        )

      case "files":
        return (
          <EmptyState
            message="No files yet"
            description="Upload files to enrich conversations and assistants with context, data analysis, feedback, or customization. Uploaded files will be displayed here."
          />
        )

      case "tools":
        return (
          <EmptyState
            message="No plugins yet"
            description="Plugins are pre-built AI applications that can be used to enhance your conversations and assistants. Plugins you create will be displayed here."
          />
        )

      case "assistants":
        return (
          <EmptyState
            message="No assistants yet"
            description="Assistants are special AI characters instructed to provide information, solve specific problems, simulate conversations or offer creative content based on user queries."
          />
        )

      default:
        return null
    }
  }

  return useMemo(
    () => (
      <div
        className="flex w-full flex-1 grow flex-col"
        onDrop={handleDrop}
        ref={divRef}
      >
        <div className="mt-2 flex size-full flex-col overflow-auto">
          {data.length === 0 && (
            <div className="flex shrink-0 grow flex-col items-center justify-center">
              {getDescription(contentType)}
            </div>
          )}

          {(dataWithFolders.length > 0 || dataWithoutFolders.length > 0) && (
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                contain: "strict"
              }}
              className={`h-full overflow-y-auto ${
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
                        <DataListComponent
                          contentType={contentType}
                          item={item}
                        />
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
                        <div key={dateCategory} className="pb-2">
                          <div className="text-muted-foreground mb-1 text-sm font-bold">
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
                                <DataListComponent
                                  contentType={contentType}
                                  item={item}
                                />
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
                        <DataListComponent
                          contentType={contentType}
                          item={item}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={cn("flex grow", isDragOver && "bg-accent")}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
        />
      </div>
    ),
    [data, folders, contentType, isOverflowing, isDragOver]
  )
}
