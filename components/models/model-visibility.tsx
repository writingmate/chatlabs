import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { LLM, LLMID } from "@/types"
import { ModelVisibilityOption } from "@/components/models/model-visibility-option"
import { IconSettings } from "@tabler/icons-react"
import { useContext, useEffect, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/db/profile"

export const DEFAULT_MODEL_VISIBILITY: Record<LLMID, boolean> = {
  "gpt-3.5-turbo-0125": true,
  "gpt-4-vision-preview": true,
  "gpt-4-turbo-preview": false,
  "gpt-4-turbo": true,
  "claude-3-haiku-20240307": true,
  "claude-3-sonnet-20240229": true,
  "claude-3-opus-20240229": true,
  "gemini-pro": true,
  "gemini-pro-vision": true,
  "mistral-large-latest": true,
  "mixtral-8x7b-32768": true,
  "sonar-small-online": true,
  "sonar-medium-online": true,
  "sonar-small-chat": false,
  "sonar-medium-chat": false,
  "gpt-4": false,
  "gpt-3.5-turbo": false,
  "gemini-1.5-pro-latest": false,
  "claude-2.1": false,
  "claude-instant-1.2": false,
  //"mistral-tiny", "mistral-small", "mistral-medium", "llama2-70b-4096"
  "mistral-tiny": false,
  "mistral-small": false,
  "mistral-medium": false,
  "llama2-70b-4096": false,
  // "pplx-7b-online", "pplx-70b-online", "pplx-7b-chat", "pplx-70b-chat"
  "pplx-7b-online": false,
  "pplx-70b-online": false,
  "pplx-7b-chat": false,
  "pplx-70b-chat": false,
  // "mixtral-8x7b-instruct", "mistral-7b-instruct", "llama-2-70b-chat", "codellama-34b-instruct", "codellama-70b-instruct"
  "mixtral-8x7b-instruct": false,
  "mistral-7b-instruct": false,
  "llama-2-70b-chat": false,
  "codellama-34b-instruct": false,
  "codellama-70b-instruct": false
}

function ModelVisibility({ models }: { models?: LLM[] }) {
  const { profile, setProfile } = useContext(ChatbotUIContext)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [visibility, setVisibility] = useState<Record<LLMID, boolean>>(
    DEFAULT_MODEL_VISIBILITY
  )

  useEffect(() => {
    if (!profile) {
      return
    }
    setVisibility(
      (profile.model_visibility || DEFAULT_MODEL_VISIBILITY) as Record<
        LLMID,
        boolean
      >
    )
  }, [])

  function handleSave() {
    if (!profile) {
      return
    }
    setProfile({
      ...profile,
      model_visibility: visibility
    })
    updateProfile(profile.id, {
      ...profile,
      model_visibility: visibility
    })
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div
          className={
            "hover:bg-accent flex w-full cursor-pointer items-center justify-start space-x-3 truncate rounded p-2 text-sm hover:opacity-50"
          }
        >
          <IconSettings stroke={1.5} className={"mr-2"} size={24} /> Manage
          models
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Configure models visibility</DialogTitle>
        <div className="max-h-[360px] w-full space-y-0 overflow-y-auto">
          {models?.map(model => (
            <ModelVisibilityOption
              key={model.modelId}
              selected={!!visibility?.[model.modelId]}
              model={model}
              onSelect={checked => {
                setVisibility({
                  ...visibility,
                  [model.modelId]: checked
                })
              }}
            />
          ))}
        </div>
        <Button onClick={handleSave}>Save</Button>
      </DialogContent>
    </Dialog>
  )
}

export { ModelVisibility }
