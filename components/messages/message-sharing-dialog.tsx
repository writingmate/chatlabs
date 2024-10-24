import { useEffect, useState } from "react"
import Link from "next/link"
import {
  checkAppSlugAvailability,
  createApplication,
  createApplicationFiles,
  generateRandomSubdomain,
  getApplicationByChatId,
  getFileByAppSlug,
  updateApplication
} from "@/db/applications"
import { createFile } from "@/db/files"
import { CodeBlock } from "@/types"
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconRefresh,
  IconWorld
} from "@tabler/icons-react"
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
import { ExternalLink } from "@/components/ui/external-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  const [subdomainError, setSubdomainError] = useState<string>("")
  const [existingApp, setExistingApp] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [description, setDescription] = useState<string>("")
  const [icon, setIcon] = useState<string>("")
  const [isEditingSubdomain, setIsEditingSubdomain] = useState(false)

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

    // should start with a letter and only contain lowercase letters, numbers, and hyphens
    // and end with a letter or number
    const subdomainRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/
    if (!subdomainRegex.test(value)) {
      setSubdomainError(
        "Subdomain can only contain lowercase letters, numbers, and hyphens"
      )
      return false
    }

    try {
      if (existingApp && existingApp.subdomain === value) return true

      const isAvailable = await checkAppSlugAvailability(value)
      if (!isAvailable) {
        setSubdomainError("This subdomain is already taken")
        return false
      }
      setSubdomainError("")
      return true
    } catch (error) {
      setSubdomainError("Error validating subdomain")
      logger.error({ error }, "Error validating subdomain")
      return false
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
        description,
        icon,
        subdomain,
        user_id: user.id,
        workspace_id: selectedWorkspace.id,
        chat_id: chatId
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
        application = await createApplication(
          {
            ...appData,
            sharing: "public",
            theme: "light",
            application_type: "web_app"
          },
          [],
          [],
          []
        )
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

  const handleEditSubdomain = () => {
    setIsEditingSubdomain(true)
  }

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(e.target.value.toLowerCase())
    setSubdomainError("")
  }

  const handleSubdomainBlur = () => {
    validateSubdomain(subdomain).then(isValid =>
      setIsEditingSubdomain(!isValid)
    )
  }

  const appUrl = `https://${subdomain}.toolzflow.app`

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
            <Label htmlFor="subdomain">Your app URL</Label>
            <div className="flex items-center space-x-2">
              {isEditingSubdomain ? (
                <div className="flex grow items-center rounded-md border bg-white">
                  <span className="text-muted-foreground px-3 pr-0.5 text-sm">
                    https://
                  </span>
                  <Input
                    id="subdomain"
                    value={subdomain}
                    onChange={handleSubdomainChange}
                    onBlur={handleSubdomainBlur}
                    placeholder="your-app"
                    className="mx-0 border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <span className="text-muted-foreground px-3 pl-0.5 text-sm">
                    .toolzflow.app
                  </span>
                </div>
              ) : (
                <Link
                  target="_blank"
                  href={appUrl}
                  className="grow rounded-md bg-gray-100 px-3 py-2 text-sm"
                >
                  {appUrl}
                </Link>
              )}
              <Button
                size="icon"
                className="shrink-0"
                variant="outline"
                onClick={
                  isEditingSubdomain
                    ? () => generateRandomSubdomain().then(setSubdomain)
                    : handleEditSubdomain
                }
                title={
                  isEditingSubdomain
                    ? "Generate random subdomain"
                    : "Edit subdomain"
                }
              >
                {isEditingSubdomain ? (
                  <IconRefresh className="size-4" />
                ) : (
                  <IconEdit className="size-4" />
                )}
              </Button>
            </div>
            {subdomainError && (
              <span className="text-destructive text-sm">{subdomainError}</span>
            )}
            <Description>Your app will be accessible at this URL.</Description>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Advanced settings</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? (
                <IconChevronUp className="size-4" />
              ) : (
                <IconChevronDown className="size-4" />
              )}
            </Button>
          </div>

          {showAdvanced && (
            <>
              <div className="flex flex-col space-y-2">
                <Textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter a description for your app"
                  rows={3}
                />
                <Description>
                  This description will be used in the webpage metadata and
                  generated{" "}
                  <ExternalLink href="https://en.wikipedia.org/wiki/Facebook_Platform#Open_Graph_protocol">
                    Open Graph
                  </ExternalLink>{" "}
                  image.
                </Description>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="icon">Icon URL</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="Enter URL for app icon/favicon"
                />
                <Description>
                  Provide a URL for your app{"'"}s icon or favicon.
                </Description>
              </div>
            </>
          )}

          <Button
            className="w-full"
            onClick={handleShare}
            loading={loading}
            disabled={loading || !!subdomainError}
          >
            <IconWorld className="mr-2 size-4" />
            {existingApp ? "Update App" : "Create and Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
