import { useEffect, useState } from "react"
import Link from "next/link"
import {
  createApplication,
  createApplicationFiles,
  generateRandomSubdomain,
  getApplicationByChatId,
  getFileByAppSlug,
  updateApplication
} from "@/db/applications"
import { createFile } from "@/db/files"
import { CodeBlock } from "@/types"
import { IconExternalLink, IconRefresh, IconWorld } from "@tabler/icons-react"
import { toast } from "sonner"

import { logger } from "@/lib/logger"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Description } from "@/components/ui/description"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
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
  const [isValidatingSubdomain, setIsValidatingSubdomain] = useState(false)
  const [subdomainError, setSubdomainError] = useState<string>("")
  const [existingApp, setExistingApp] = useState<any>(null)

  useEffect(() => {
    setFilename(defaultFilename)
    setSubdomainError("")

    logger.info({ chatId }, "Checking existing application")

    if (chatId) {
      checkExistingApplication()
    } else {
      generateRandomSubdomain().then(setSubdomain)
    }
  }, [codeBlock, chatId, defaultFilename])

  const checkExistingApplication = async () => {
    try {
      const app = await getApplicationByChatId(chatId!)
      if (app) {
        setExistingApp(app)
        setSubdomain(app.subdomain || "")
        setFilename(app.name || defaultFilename)
      }
      if (!app?.subdomain) {
        generateRandomSubdomain().then(setSubdomain)
      }
    } catch (error) {
      logger.error({ error, chatId }, "Error checking existing application")
      generateRandomSubdomain().then(setSubdomain)
    }
  }

  const validateSubdomain = async (value: string) => {
    if (!value) {
      setSubdomainError("Subdomain is required")
      return false
    }

    const subdomainRegex = /^[a-z0-9-]+$/
    if (!subdomainRegex.test(value)) {
      setSubdomainError(
        "Subdomain can only contain lowercase letters, numbers, and hyphens"
      )
      return false
    }

    setIsValidatingSubdomain(true)
    try {
      if (existingApp && existingApp.subdomain === value) return true

      const existingAppBySlug = await getFileByAppSlug(value)
      if (existingAppBySlug) {
        setSubdomainError("This subdomain is already taken")
        return false
      }
      setSubdomainError("")
      return true
    } catch (error) {
      logger.error({ error }, "Error validating subdomain")
      return true
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
      const htmlFile = new File([codeBlock.code], filename || "index.html", {
        type: "text/html"
      })

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

      const appData = {
        name: filename,
        description: "",
        subdomain,
        user_id: user.id,
        workspace_id: selectedWorkspace.id,
        chat_id: chatId,
        sharing: "public",
        application_type: "html",
        theme: "light"
      }

      let application
      if (existingApp) {
        application = await updateApplication(
          existingApp.id,
          appData,
          [],
          [],
          []
        )
        logger.info(
          { applicationId: application.id },
          "Updated existing application"
        )
      } else {
        application = await createApplication(appData, [], [], [])
        logger.info(
          { applicationId: application.id },
          "Created new application"
        )
      }

      await createApplicationFiles([
        {
          application_id: application.id,
          file_id: fileResult.id,
          user_id: user.id
        }
      ])

      setExistingApp(application)
      toast.success(
        existingApp ? "App updated successfully!" : "App shared successfully!"
      )
    } catch (error) {
      logger.error({ error }, "Failed to share app")
      toast.error("Failed to share app")
    } finally {
      setLoading(false)
    }
  }

  const currentAppUrl = existingApp
    ? `https://${existingApp.subdomain}.toolzflow.app`
    : ""
  const newAppUrl = `https://${subdomain}.toolzflow.app`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Share your app
          </DialogTitle>
          <DialogDescription>
            Create a public URL for your app. You can customize the subdomain or
            use the generated one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="app-name">App name</Label>
            <Input
              id="app-name"
              value={filename}
              onChange={e => setFilename(e.target.value)}
              placeholder="Enter your app name"
            />
            <Description>
              This will be the title of your shared app.
            </Description>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="subdomain">Choose your subdomain</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="subdomain"
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
              <Button
                size="icon"
                variant="outline"
                onClick={() => generateRandomSubdomain().then(setSubdomain)}
                title="Generate random subdomain"
              >
                <IconRefresh className="size-4" />
              </Button>
            </div>
            {subdomainError && (
              <span className="text-destructive text-sm">{subdomainError}</span>
            )}
            <Description>
              Your app will be accessible at this URL. You can use the generated
              subdomain or create your own.
            </Description>
          </div>

          {existingApp && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Public</Badge>
              <Link
                href={currentAppUrl}
                target="_blank"
                className="text-sm text-blue-500 hover:underline"
              >
                {currentAppUrl}
              </Link>
              <CopyButton value={currentAppUrl} />
            </div>
          )}

          {existingApp && subdomain !== existingApp.subdomain && (
            <Description>New URL after update: {newAppUrl}</Description>
          )}

          <Button
            className="w-full"
            onClick={handleShare}
            loading={loading || isValidatingSubdomain}
            disabled={loading || isValidatingSubdomain || !!subdomainError}
          >
            <IconWorld className="mr-2 size-4" />
            {existingApp ? "Update App" : "Create and Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
