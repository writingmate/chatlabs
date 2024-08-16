"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconArrowsShuffle } from "@tabler/icons-react"
import { AuthProvider, useAuth } from "@/context/auth"

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
    <Button
      color={"primary"}
      variant={"ghost"}
      loading={isRemixing}
      onClick={handleRemix}
      size={"sm"}
      disabled={isRemixing}
    >
      <IconArrowsShuffle size={18} className={"mr-2"} stroke={1.5} />
      {isRemixing ? "Remixing..." : "Remix"}
    </Button>
  )
}

const RemixButton: React.FC<RemixButtonProps> = ({ fileId }) => {
  return (
    <AuthProvider>
      <InnerRemixButton fileId={fileId} />
    </AuthProvider>
  )
}

export default RemixButton
