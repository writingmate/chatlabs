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
import Link from "next/link"
import { getPublicPrompts } from "@/db/prompts"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tables } from "@/supabase/types"
import { PromptIcon } from "@/components/prompts/prompt-icon"

function Prompts({
  showCreateButton = true,
  data
}: {
  showCreateButton?: boolean
  data: Tables<"prompts">[]
}) {
  return (
    <PageContent className={"container h-full justify-start"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>Prompts</PageTitle>
        {showCreateButton && (
          <SidebarCreateButtons
            contentType={"prompts"}
            hasData={data?.length > 0}
          />
        )}
      </PageHeader>
      <div className="grid w-full grid-cols-2 items-start justify-between gap-2 pb-6">
        {data?.map(prompt => (
          <Link href={`./prompts/${prompt.id}`} key={prompt.id}>
            <Card className={"hover:bg-foreground/5 rounded-xl border-none"}>
              <CardContent className={"flex space-x-3 p-4"}>
                <PromptIcon prompt={prompt} />
                <div className={"flex flex-col"}>
                  <CardTitle className={"text-md line-clamp-1"}>
                    {prompt.name}
                  </CardTitle>
                  <CardDescription className={"line-clamp-3 text-xs"}>
                    {prompt.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {data.length === 0 && (
          <div className="flex h-full items-center justify-center text-2xl">
            No prompts found <br /> Create a new prompt to get started{" "}
          </div>
        )}
      </div>
    </PageContent>
  )
}

export default async function PromptsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const data = await getPublicPrompts(supabase)

  return <Prompts data={data} />
}
