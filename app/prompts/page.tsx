import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
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
import { PromptIcon } from "@/components/prompts/prompt-icon"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/supabase/types"

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

function getPageTitle(category?: string) {
  return !category || category === "All" ? "Prompts" : category + " Prompts"
}
export function generateMetadata({ c: category }: { c?: string }) {
  const title = getPageTitle(category)
  return {
    title: `Best ${title} for Large Language Models`,
    description: `Explore ${category} prompts for large language models`
  }
}

export default async function PromptsPage({
  searchParams: { c: category }
}: {
  searchParams: { c?: ArrayElement<Tables<"prompts">["category"]> | "All" }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const data = await getPublicPrompts(supabase)

  const filteredData =
    !!category && category !== "All"
      ? data?.filter(x => x.category?.includes(category))
      : data

  const categories = [
    "All",
    ...data.reduce((acc, prompt) => {
      prompt.category?.forEach((category: string) => {
        if (!acc.includes(category)) {
          acc.push(category)
        }
      })
      return acc
    }, [] as string[])
  ]

  const categoryTitle = getPageTitle(category)

  return (
    <PageContent className={"container h-full justify-start"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>{categoryTitle}</PageTitle>
        <div className={"flex space-x-2"}>
          {
            <SidebarCreateButtons
              contentType={"prompts"}
              hasData={data?.length > 0}
            />
          }
        </div>
      </PageHeader>
      <div className="flex space-x-2 pb-6">
        {categories.map((cat: string, index: number) => (
          <Badge variant={cat === category ? "default" : "outline"} key={index}>
            <Link href={"/prompts?c=" + cat}>{cat}</Link>
          </Badge>
        ))}
      </div>
      <div className="grid w-full grid-cols-2 items-start justify-between gap-2 pb-6 lg:grid-cols-3">
        {filteredData?.map(prompt => (
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
