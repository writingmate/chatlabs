"use client"

import { useContext, useEffect, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { acceptInvite, getPendingInvites } from "@/db/workspaces"
import { Tables } from "@/supabase/types"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { useRouter } from "next/navigation"

type WorkspaceUser = Awaited<ReturnType<typeof getPendingInvites>>[number]

export const InviteHandler = () => {
  const [pendingInvites, setPendingInvites] = useState<WorkspaceUser[]>([])
  const [currentInvite, setCurrentInvite] = useState<WorkspaceUser | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  const { selectedWorkspace, setSelectedWorkspace, setWorkspaces } =
    useContext(ChatbotUIContext)
  const router = useRouter()

  useEffect(() => {
    const checkInvites = async () => {
      if (!selectedWorkspace) return
      const invites = await getPendingInvites(selectedWorkspace.user_id)
      setPendingInvites(invites)
      if (invites.length > 0) {
        setCurrentInvite(invites[0])
        setIsOpen(true)
      }
    }

    checkInvites()
  }, [selectedWorkspace])

  const handleAcceptInvite = async () => {
    if (!currentInvite || !selectedWorkspace) return

    try {
      const acceptedWorkspace = await acceptInvite(
        currentInvite.workspace_id,
        selectedWorkspace.user_id
      )
      setWorkspaces(prevWorkspaces => [...prevWorkspaces, acceptedWorkspace])
      setSelectedWorkspace(acceptedWorkspace)
      setPendingInvites(prevInvites =>
        prevInvites.filter(
          invite => invite.workspace_id !== currentInvite.workspace_id
        )
      )
      setIsOpen(false)
      router.push("/chat")
    } catch (error) {
      console.error("Error accepting invite:", error)
    }
  }

  const handleDeclineInvite = () => {
    if (!currentInvite) return
    setPendingInvites(prevInvites =>
      prevInvites.filter(
        invite => invite.workspace_id !== currentInvite.workspace_id
      )
    )
    setIsOpen(false)
    if (pendingInvites.length > 1) {
      setCurrentInvite(pendingInvites[1])
      setIsOpen(true)
    }
  }

  if (!currentInvite) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workspace Invite</DialogTitle>
          <DialogDescription>
            You have been invited to join a {'"'}
            {currentInvite.workspaces?.name}
            {'"'} workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleDeclineInvite}>
            Decline
          </Button>
          <Button onClick={handleAcceptInvite}>Join Workspace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
