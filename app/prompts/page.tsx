import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import {
  getPromptCategories,
  getPromptWorkspacesByWorkspaceId,
  getPublicPrompts
} from "@/db/prompts"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tables } from "@/supabase/types"
import Search from "@/components/ui/search"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { PromptsList } from "@/components/prompts/prompts-list"
import { PromptCategories } from "@/components/prompts/prompt-categories"

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

function getPageTitle(category?: string) {
  return !category || category === "All" ? "Prompts" : category + " Prompts"
}

export function generateMetadata({
  searchParams: { c: category }
}: {
  searchParams: { c?: string }
}) {
  const title = getPageTitle(category)
  return {
    title: `Best ${title} for Large Language Models`,
    description: `Explore ${category} prompts for large language models`
  }
}

const YOUR_PROMPTS = "Your Prompts"
export default async function PromptsPage({
  searchParams: { c: category, q: query }
}: {
  searchParams: {
    c?: ArrayElement<Tables<"prompt_category">["name"]> | typeof YOUR_PROMPTS
    q?: string
  }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const searchCategory = category === YOUR_PROMPTS ? undefined : category
  const categories = await getPromptCategories(supabase)
  const session = (await supabase.auth.getSession()).data?.session
  const isAnonymous = !session?.user
  let workspacePrompts = []
  let categoryTitle = getPageTitle(category)

  let data = await getPublicPrompts(supabase, {
    category: searchCategory,
    query
  })

  // If user is logged in, get their workspace prompts
  if (!isAnonymous && session?.user) {
    const workspaceId = await getHomeWorkspaceByUserId(
      session?.user.id,
      supabase
    )
    workspacePrompts = (
      await getPromptWorkspacesByWorkspaceId(workspaceId, supabase)
    ).prompts
    categories.unshift({ id: "your-prompts", name: YOUR_PROMPTS } as any)
    if (category === YOUR_PROMPTS) {
      categoryTitle = YOUR_PROMPTS
      data = workspacePrompts
    } else {
      const workspacePromptsIds = workspacePrompts.map(p => p.id)
      data = [
        ...data,
        ...workspacePrompts.filter(p => !workspacePromptsIds.includes(p.id))
      ]
    }
  }

  return (
    <PageContent className={"container h-full justify-start"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>{categoryTitle}</PageTitle>
        <div className={"flex space-x-2"}>
          <Search className={"w-18 h-8"} placeholder={"Search prompts..."} />
          {
            <SidebarCreateButtons
              contentType={"prompts"}
              hasData={data?.length > 0}
            />
          }
        </div>
      </PageHeader>
      <PromptCategories categories={categories} selected={category} />
      <PromptsList prompts={data} />
    </PageContent>
  )
}
