"use client"

import { FC, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  IconArrowFork,
  IconArrowsShuffle,
  IconCopy,
  IconInfoCircle
} from "@tabler/icons-react"
import { AuthProvider, useAuth } from "@/context/auth"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"

interface RemixButtonProps {
  fileId: string
}

function InnerRemixButton({ fileId }: RemixButtonProps) {
  const [isRemixing, setIsRemixing] = useState(false)
  const { user } = useAuth()

  const handleRemix = async () => {
    window.location.href = !user
      ? `/login?next=/chat?remix=${fileId}`
      : `/chat?remix=${fileId}`
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={"default"}
        loading={isRemixing}
        onClick={handleRemix}
        size={"sm"}
        disabled={isRemixing}
        title="Create your own version of this chat"
      >
        <IconArrowFork size={18} className={"mr-2"} stroke={1.5} />
        {isRemixing ? "Creating..." : "Make your version"}
      </Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="size-8 p-0">
            <IconInfoCircle size={18} stroke={1.5} />
            <span className="sr-only">What is ChatLabs?</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">What is ChatLabs?</h4>
              <p className="text-muted-foreground text-sm">
                ChatLabs is an open-source platform that allows you to create,
                share, and remix AI-powered chat experiences. Built with
                Next.js, Supabase, and various AI models, it enables users to
                customize and experiment with different chat configurations.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const RemixButton: FC<RemixButtonProps> = ({ fileId }) => {
  return (
    <AuthProvider>
      <InnerRemixButton fileId={fileId} />
    </AuthProvider>
  )
}

export default RemixButton
