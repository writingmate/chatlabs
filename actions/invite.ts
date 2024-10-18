interface InviteUserRequest {
  email: string;
  workspace_id?: string;
}

export async function inviteUser(
  data: InviteUserRequest
): Promise<unknown> {
  return fetch('/api/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}


