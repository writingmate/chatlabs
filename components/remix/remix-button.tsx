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
