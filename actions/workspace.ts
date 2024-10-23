"use server"
import { cookies } from "next/headers"

export async function setWorkspaceIdCookie(workspaceId: string) {
    cookies().set("workspaceId", workspaceId)
}
