export type WorkspaceUser = {
  user_id: string | null
  email: string
  role: "OWNER" | "MEMBER"
  status: "INVITED" | "ACTIVE" | "PENDING"
}
