import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CopyButton } from "@/components/messages/message-codeblock"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createFile } from "@/db/files"
import { IconShare3, IconWorld } from "@tabler/icons-react"

interface MessageSharingDialogProps {
  user: any
  fileContent: string
  selectedWorkspace: any
  chatSettings: any
  defaultFilename: string
  open: boolean
  setOpen: (open: boolean) => void
}

export function MessageSharingDialog({
  user,
  fileContent,
  selectedWorkspace,
  chatSettings,
  defaultFilename,
  open,
  setOpen
}: MessageSharingDialogProps) {
  const [filename, setFilename] = useState<string>(defaultFilename)
  const [loading, setLoading] = useState<boolean>(false)
  const [url, setUrl] = useState<string>("")

  const handleShare = () => {
    if (!selectedWorkspace || !chatSettings || !user) {
      toast.error("Please select a workspace")
      return
    }

    setLoading(true)

    const htmlFile: File = new File([fileContent], filename || "index.html", {
      type: "text/html"
    })

    createFile(
      htmlFile,
      {
        user_id: user.id,
        description: "",
        file_path: "",
        name: htmlFile.name,
        size: htmlFile.size,
        sharing: "public",
        tokens: 0,
        type: "html"
      },
      selectedWorkspace.id,
      chatSettings.embeddingsProvider
    )
      .then(result => {
        setUrl(window.location.origin + `/share/${result.hashid}`)
      })
      .catch(error => {
        toast.error("Failed to upload.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>Sharing an app</DialogHeader>
        <DialogDescription className={"flex flex-col space-y-2"}>
          {!url ? (
            <>
              <div className={"flex flex-col space-y-1"}>
                <Label>App name</Label>
                <div className={"flex space-x-1"}>
                  <Input
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className={"w-full"}
                onClick={handleShare}
                loading={loading}
                disabled={loading}
              >
                <IconWorld className={"mr-1"} size={16} />
                Share
              </Button>
            </>
          ) : (
            <div className={"flex flex-col space-y-1"}>
              <Label>Here is your shareable link</Label>
              <div
                className={
                  "flex items-center justify-between space-x-1 text-center"
                }
              >
                <Input readOnly={true} value={url} />
                <CopyButton className={"text-foreground"} value={url} />
              </div>
            </div>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
