import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { LLM, LLMID } from "@/types"
import { ModelVisibilityOption } from "@/components/models/model-visibility-option"
import { IconSettings, IconFilterOff } from "@tabler/icons-react"
import { useContext, useEffect, useState, useMemo, useCallback } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/db/profile"
import {
  AdvancedContent,
  InfoIconTooltip
} from "@/components/ui/chat-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import {
  DEFAULT_SYSTEM_PROMPT,
  validateSystemPromptTemplate
} from "@/lib/build-prompt"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { updateWorkspace } from "@/db/workspaces"
import { SearchInput } from "@/components/ui/search-input"
import { ModelDetails } from "@/components/models/model-details"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { CATEGORIES } from "@/lib/models/categories"
import debounce from "lodash/debounce"
import { VList } from "virtua"
import { HoverCardPortal } from "@radix-ui/react-hover-card"

export const DEFAULT_MODEL_VISIBILITY: Record<LLMID, boolean> = {
  "gpt-3.5-turbo-0125": false,
  "gpt-4-vision-preview": false,
  "gpt-4-turbo-preview": false,
  "gpt-4-turbo": false,
  "gpt-4o-mini": true,
  "gpt-4o-2024-08-06": true,
  "claude-3-haiku-20240307": true,
  "claude-3-sonnet-20240229": false,
  "claude-3-5-sonnet-20240620": true,
  "claude-3-opus-20240229": false,
  "gemini-pro": false,
  "gemini-pro-vision": false,
  "mistral-large-latest": true,
  "mixtral-8x7b-32768": true,
  "llama-3.1-sonar-small-128k-online": true,
  "llama-3.1-sonar-large-128k-online": true,
  "llama-3.1-sonar-huge-128k-online": true,
  "llama-3.1-sonar-small-128k-chat": false,
  "llama-3.1-sonar-large-128k-chat": false,
  "gpt-4": false,
  "gpt-3.5-turbo": false,
  "gemini-1.5-pro-latest": true,
  "claude-2.1": false,
  "claude-instant-1.2": false,
  "mistral-tiny": false,
  "mistral-small": false,
  "mistral-medium": false,
  // "llama2-70b-4096": false,
  "llama3-70b-8192": false,
  "llama3-8b-8192": false,
  "gpt-4o": true,
  "gemini-1.5-flash-latest": true,
  "o1-mini": true,
  "o1-preview": true
}

const SYSTEM_PROMPT_DESCRIPTION = `
The system prompt is a message that the AI will use to start the conversation. 
It should contain the following dynamic variables for ChatLabs functioning properly: {profile_context}, {local_date}, and {assistant}. {profile_context} is the user's profile context, {local_date} is the current date, and {assistant} is the name of the assistant and it's instructions.
`

const SYSTEM_PROMPT_WARNING = `
The system prompt should contain the following dynamic variables for ChatLabs functioning properly: {profile_context}, {local_date}, and {assistant}. {profile_context} is the user's profile context, {local_date} is the current date, and {assistant} is the name of the assistant and it's instructions.`

export const ModelSettings = ({ models }: { models?: LLM[] }) => {
  const {
    profile,
    selectedWorkspace,
    setChatSettings,
    setProfile,
    chatSettings
  } = useContext(ChatbotUIContext)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [visibility, setVisibility] = useState<Record<LLMID, boolean>>(
    {} as Record<LLMID, boolean>
  )

  const [systemPromptTemplate, setSystemPromptTemplate] = useState(
    profile?.system_prompt_template || DEFAULT_SYSTEM_PROMPT
  )

  const validSystemPrompt = validateSystemPromptTemplate(systemPromptTemplate)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTier, setSelectedTier] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all")

  const tiers = [
    { value: "all", label: "All Tiers" },
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro" },
    { value: "ultimate", label: "Ultimate" }
  ]

  const categories = [
    { value: "all", label: "All Categories" },
    ...Object.entries(CATEGORIES).map(([key, value]) => ({
      value: key,
      label: value.category
    }))
  ]

  const visibilityOptions = [
    { value: "all", label: "All Models" },
    { value: "enabled", label: "Selected Models" },
    { value: "disabled", label: "Unselected Models" }
  ]

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Debounce the search query update
  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setDebouncedSearchQuery(value)
    }, 300),
    []
  )

  // Update both the immediate and debounced search queries
  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value)
    debouncedSetSearchQuery(value)
  }

  // Memoize the filtered models
  const filteredModels = useMemo(() => {
    return models?.filter(
      model =>
        model.modelName
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) &&
        (selectedTier === "all" || model.tier === selectedTier) &&
        (selectedCategory === "all" ||
          model.categories?.some(
            cat => cat.category === CATEGORIES[selectedCategory].category
          )) &&
        (visibilityFilter === "all" ||
          (visibilityFilter === "enabled" && visibility[model.modelId]) ||
          (visibilityFilter === "disabled" && !visibility[model.modelId]))
    )
  }, [
    models,
    debouncedSearchQuery,
    selectedTier,
    selectedCategory,
    visibilityFilter,
    visibility
  ])

  useEffect(() => {
    if (models) {
      const initialVisibility = models.reduce(
        (acc, model) => {
          acc[model.modelId] =
            (profile?.model_visibility as Record<LLMID, boolean>)?.[
              model.modelId
            ] ??
            DEFAULT_MODEL_VISIBILITY[model.modelId] ??
            false
          return acc
        },
        {} as Record<LLMID, boolean>
      )
      setVisibility(initialVisibility)
    }
  }, [models, profile])

  function handleSave() {
    if (!profile) {
      return
    }
    setProfile({
      ...profile,
      model_visibility: visibility,
      system_prompt_template: systemPromptTemplate
    })
    updateProfile(profile.id, {
      ...profile,
      model_visibility: visibility,
      system_prompt_template: systemPromptTemplate
    })
    updateWorkspace(selectedWorkspace!.id, {
      // ...selectedWorkspace!,
      default_temperature: chatSettings?.temperature,
      default_context_length: chatSettings?.contextLength
    })
    setDialogOpen(false)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedTier("all")
    setSelectedCategory("all")
    setVisibilityFilter("all")
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div
          className={
            "hover:bg-accent flex w-full cursor-pointer items-center justify-start truncate rounded p-2 text-sm hover:opacity-50"
          }
        >
          <IconSettings
            stroke={1.5}
            className={"mr-2 shrink-0 opacity-50"}
            size={24}
          />{" "}
          <div className={"flex flex-col"}>
            <div className={"flex items-center space-x-3"}>
              Discover and manage models
            </div>
            <div className={"text-foreground/60 text-xs"}>
              Configure and discover all LLM models here.
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="flex h-[90vh] max-w-2xl flex-col">
        <DialogTitle>Manage models</DialogTitle>
        <DialogDescription>
          Configure and discover all LLM models here.
        </DialogDescription>
        <Tabs className="flex w-full grow flex-col">
          <TabsList className="mx-auto">
            <TabsTrigger value="visibility" title="Model visibility">
              Discover models
            </TabsTrigger>
            <TabsTrigger value="basic" title="Basic settings">
              Model parameters
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="basic"
            className="flex grow flex-col [&[hidden]]:hidden"
          >
            <div className="mb-4 mt-2 flex items-center space-x-2">
              <Label>System Prompt</Label>
              <InfoIconTooltip label={SYSTEM_PROMPT_DESCRIPTION} />
            </div>
            <TextareaAutosize
              minRows={3}
              className="mt-2"
              value={systemPromptTemplate}
              onValueChange={value => {
                setSystemPromptTemplate(value)
              }}
            />
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setSystemPromptTemplate(DEFAULT_SYSTEM_PROMPT)
                }}
                className={"text-xs"}
                variant={"link"}
              >
                Reset to default
              </Button>
              {!validSystemPrompt && (
                <WithTooltip
                  trigger={
                    <div className="text-xs text-yellow-500">
                      Missing dynamic variables
                    </div>
                  }
                  display={SYSTEM_PROMPT_WARNING}
                />
              )}
            </div>
            <AdvancedContent
              showOverrideSystemPrompt={true}
              chatSettings={chatSettings!}
              onChangeChatSettings={setChatSettings}
              showTooltip={true}
            />
          </TabsContent>
          <TabsContent
            value="visibility"
            className="flex grow flex-col justify-start"
          >
            <div className="mb-4 flex flex-col flex-wrap items-center gap-2">
              <SearchInput
                placeholder="Search models..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
                className="w-full"
              />
              <div className="grid w-full grid-cols-3 gap-2">
                <Select
                  value={selectedTier}
                  onValueChange={value => setSelectedTier(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map(tier => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedCategory}
                  onValueChange={value => setSelectedCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={visibilityFilter}
                  onValueChange={value => setVisibilityFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-muted-foreground mb-2 text-sm">
              Note: Not all models have assigned categories. Filtering by
              category may exclude some models.
            </div>
            <div className="grow overflow-hidden">
              <VList className="size-full space-y-0">
                {filteredModels && filteredModels.length > 0 ? (
                  filteredModels.map(model => (
                    <HoverCard
                      key={model.modelId}
                      openDelay={100}
                      closeDelay={0}
                    >
                      <HoverCardTrigger>
                        <ModelVisibilityOption
                          selected={visibility[model.modelId] ?? false}
                          model={model}
                          onSelect={checked => {
                            setVisibility(prev => ({
                              ...prev,
                              [model.modelId]: checked
                            }))
                          }}
                        />
                      </HoverCardTrigger>
                      <HoverCardPortal>
                        <HoverCardContent
                          align="start"
                          sideOffset={-4}
                          side="left"
                          className="w-90"
                        >
                          <ModelDetails model={model} />
                        </HoverCardContent>
                      </HoverCardPortal>
                    </HoverCard>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-muted-foreground mb-2">
                      No models found with the current filters.
                    </p>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="flex items-center"
                    >
                      <IconFilterOff className="mr-2" size={16} />
                      Reset Filters
                    </Button>
                  </div>
                )}
              </VList>
            </div>
          </TabsContent>
        </Tabs>
        <Button onClick={handleSave}>Save for all future chats</Button>
      </DialogContent>
    </Dialog>
  )
}
