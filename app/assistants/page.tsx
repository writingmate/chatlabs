import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Dashboard } from "@/components/ui/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import Link from "next/link"
import { getPublicAssistants } from "@/db/assistants"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { SupabaseClient } from "@supabase/supabase-js"
import { ReactNode } from "react"
import { Tables } from "@/supabase/types"

function Assistants({
  showCreateButton = true,
  data
}: {
  showCreateButton?: boolean
  data: Tables<"assistants">[]
}) {
  return (
    <PageContent className={"h-full justify-start pb-5"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>Assistants</PageTitle>
        {showCreateButton && (
          <SidebarCreateButtons
            contentType={"assistants"}
            hasData={data?.length > 0}
          />
        )}
      </PageHeader>
      <div className="grid w-full grid-cols-2 items-start justify-between gap-2">
        {data?.map(assistant => (
          <Link href={`./assistants/${assistant.id}`} key={assistant.id}>
            <Card className={"hover:bg-foreground/5 rounded-xl border-none"}>
              <CardContent className={"flex space-x-3 p-4"}>
                <AssistantIcon
                  className={"size-[76px] rounded-xl"}
                  assistant={assistant}
                  size={50}
                />
                <div className={"flex flex-col"}>
                  <CardTitle className={"text-md line-clamp-1"}>
                    {assistant.name}
                  </CardTitle>
                  <CardDescription className={"line-clamp-3 text-xs"}>
                    {assistant.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {data.length === 0 && (
          <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
            No assistants found <br /> Create a new assistant to get started{" "}
          </div>
        )}
      </div>
    </PageContent>
  )
}

export default async function AssistantsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const data = await getPublicAssistants(supabase)

  const isAnon = !(await supabase.auth.getSession()).data.session

  if (isAnon) {
    return <Assistants showCreateButton={false} data={data} />
  }

  return (
    <Dashboard>
      <Assistants data={data} />
    </Dashboard>
  )
}
