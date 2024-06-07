import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import { PromptIcon } from "@/components/prompts/prompt-icon"
import { Tables } from "@/supabase/types"

export function PromptsList({ prompts }: { prompts: Tables<"prompts">[] }) {
  return (
    <div className="grid w-full grid-cols-2 items-start justify-between gap-2 pb-6 lg:grid-cols-3">
      {prompts?.map(prompt => (
        <Link href={`/prompts/${prompt.id}`} key={prompt.id}>
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
      {prompts.length === 0 && (
        <div className="col-span-3 flex h-full items-center justify-center text-center align-middle text-2xl">
          Prompts are pre-saved text inputs designed to generate specific
          responses and communicate with AI quicker. Prompts you create will be
          displayed here.
        </div>
      )}
    </div>
  )
}
