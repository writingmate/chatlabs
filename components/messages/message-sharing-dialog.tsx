import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createFile } from "@/db/files"
import { IconExternalLink, IconShare3, IconWorld } from "@tabler/icons-react"
import Link from "next/link"

import { CopyButton } from "@/components/ui/copy-button"

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

  useEffect(() => {
    setFilename(defaultFilename)
    setUrl("")
  }, [fileContent])

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
        console.error(error)
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
        {!url ? (
          <>
            <div className={"flex flex-col space-y-2"}>
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
          <div className={"flex flex-col space-y-2"}>
            <Label>Here is your shareable link</Label>
            <div
              className={
                "flex items-center justify-between space-x-1 text-center"
              }
            >
              <div
                className={
                  "border-input flex h-8 flex-1 items-center space-x-1 rounded-md border px-2 text-left text-sm"
                }
              >
                <IconExternalLink size={16} stroke={1.5} />
                <Link
                  className={"flex-1 underline"}
                  href={url}
                  target={"_blank"}
                >
                  {url}
                </Link>
              </div>
              <CopyButton
                variant={"outline"}
                className={"text-foreground size-8"}
                value={url}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
