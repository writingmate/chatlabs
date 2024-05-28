import { NextResponse } from "next/server"

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status })
}
