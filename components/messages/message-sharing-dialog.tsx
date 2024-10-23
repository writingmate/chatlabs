import { useEffect, useState } from "react"
import Link from "next/link"
import {
  createApplication,
  createApplicationFiles,
  getFileByAppSlug
} from "@/db/applications"
import { createFile } from "@/db/files"
import { CodeBlock } from "@/types"
import { IconExternalLink, IconShare3, IconWorld } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MessageSharingDialogProps {
  user: any
  codeBlock: CodeBlock
  selectedWorkspace: any
  chatSettings: any
  defaultFilename: string
  open: boolean
  setOpen: (open: boolean) => void
  chatId?: string
}

export function MessageSharingDialog({
  user,
  codeBlock,
  selectedWorkspace,
  chatSettings,
  defaultFilename,
  open,
  setOpen,
  chatId
}: MessageSharingDialogProps) {
  const [filename, setFilename] = useState<string>(defaultFilename)
  const [subdomain, setSubdomain] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [url, setUrl] = useState<string>("")
  const [isValidatingSubdomain, setIsValidatingSubdomain] = useState(false)
  const [subdomainError, setSubdomainError] = useState<string>("")

  useEffect(() => {
    setFilename(defaultFilename)
    setUrl("")
    setSubdomain("")
    setSubdomainError("")
  }, [codeBlock])

  const validateSubdomain = async (value: string) => {
    if (!value) {
      setSubdomainError("Subdomain is required")
      return false
    }

    // Check if subdomain matches allowed pattern
    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(value)) {
      setSubdomainError(
        "Subdomain can only contain lowercase letters, numbers, and hyphens"
      )
      return false
    }

    setIsValidatingSubdomain(true)
    try {
      const existingApp = await getFileByAppSlug(value)
      if (existingApp) {
        setSubdomainError("This subdomain is already taken")
        return false
      }
      setSubdomainError("")
      return true
    } catch (error) {
      console.error({ error }, "Error validating subdomain")
      return true // If error fetching, assume available
    } finally {
      setIsValidatingSubdomain(false)
    }
  }

  const handleShare = async () => {
    if (!selectedWorkspace || !chatSettings || !user) {
      toast.error("Please select a workspace")
      return
    }

    if (!subdomain) {
      setSubdomainError("Subdomain is required")
      return
    }

    const isValid = await validateSubdomain(subdomain)
    if (!isValid) return

    setLoading(true)

    try {
      const htmlFile: File = new File(
        [codeBlock.code],
        filename || "index.html",
        {
          type: "text/html"
        }
      )

      // Create file
      const fileResult = await createFile(
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

      // Create or update application
      const application = await createApplication(
        {
          name: filename,
          description: "",
          subdomain: subdomain,
          user_id: user.id,
          workspace_id: selectedWorkspace.id,
          chat_id: chatId,
          sharing: "public",
          application_type: "html",
          theme: "light"
        },
        [], // models
        [], // tools
        [] // platformTools
      )

      // Create association between file and application
      await createApplicationFiles([
        {
          application_id: application.id,
          file_id: fileResult.id,
          user_id: user.id
        }
      ])

      setUrl(`https://${subdomain}.toolzflow.app`)
      toast.success("App shared successfully!")
    } catch (error) {
      console.error({ error }, "Failed to share app")
      toast.error("Failed to share app")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>Share your app</DialogHeader>
        {!url ? (
          <>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>App name</Label>
                <Input
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Choose your subdomain</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={subdomain}
                    onChange={e => {
                      setSubdomain(e.target.value.toLowerCase())
                      setSubdomainError("")
                    }}
                    onBlur={() => validateSubdomain(subdomain)}
                    placeholder="your-app"
                  />
                  <span className="text-muted-foreground text-sm">
                    .toolzflow.app
                  </span>
                </div>
                {subdomainError && (
                  <span className="text-destructive text-sm">
                    {subdomainError}
                  </span>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleShare}
              loading={loading || isValidatingSubdomain}
              disabled={loading || isValidatingSubdomain || !!subdomainError}
            >
              <IconWorld className="mr-1" size={16} />
              Share
            </Button>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <Label>Here is your app URL</Label>
            <div className="flex items-center justify-between space-x-1 text-center">
              <div className="border-input flex h-8 flex-1 items-center space-x-1 rounded-md border px-2 text-left text-sm">
                <IconExternalLink size={16} stroke={1.5} />
                <Link className="flex-1 underline" href={url} target="_blank">
                  {url}
                </Link>
              </div>
              <CopyButton
                variant="outline"
                className="text-foreground size-8"
                value={url}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
