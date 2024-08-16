"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconArrowsShuffle } from "@tabler/icons-react"

interface RemixButtonProps {
  fileId: string
}

const RemixButton: React.FC<RemixButtonProps> = ({ fileId }) => {
  const [isRemixing, setIsRemixing] = useState(false)

  const handleRemix = async () => {
    setIsRemixing(true)
    try {
      const response = await fetch(`/api/remix/${fileId}`, {
        method: "POST"
      })
      if (response.ok) {
        const data = await response.json()
        window.location.href = `/chat/${data.chatId}` // Redirect to the new chat
      } else {
        if (response.status === 401) {
          // You might want to show a login dialog here
          console.error("User is not authenticated")
          window.location.href = "/login?next=" + window.location.pathname
        }
        console.error("Failed to remix")
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error remixing:", error)
      // You might want to show an error message to the user here
    }
    setIsRemixing(false)
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

export default RemixButton
