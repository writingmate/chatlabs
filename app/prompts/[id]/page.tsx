import { getPromptById } from "@/db/prompts"
import { Button } from "@/components/ui/button"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getAllModels } from "@/db/models"
import { ModelIcon } from "@/components/models/model-icon"
import { LLM, ModelProvider } from "@/types"

export default async function PromptsPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(params.id)
  const models = await getAllModels()

  // group by provider
  const modelsByProvider = models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<ModelProvider, LLM[]>
  )

  return (
    <PageContent className={"container w-full pt-10 lg:w-2/3"}>
      <PageHeader className={"flex w-full items-center justify-between"}>
        <PageTitle className={"flex items-center space-y-2"}>
          <div className={"flex flex-col justify-start space-y-1"}>
            <div>
              AI Prompt &ldquo;{prompt.icon} {prompt.name}&rdquo;
            </div>
            <div className={"flex justify-start space-x-1"}>
              {prompt.category?.map((category, index) => (
                <Badge variant={"outline"} key={index}>
                  <Link href={`/prompts?c=${category}`}>{category}</Link>
                </Badge>
              ))}
            </div>
          </div>
        </PageTitle>
        <Button type={"submit"} size={"sm"}>
          <Link href={`/chat?prompt_id=${prompt.id}`}>Use this prompt</Link>
        </Button>
      </PageHeader>
      <div className={"flex w-full flex-col space-y-8 pb-6"}>
        <div className={"flex w-full flex-col space-y-1"}>
          <Label>AI prompt description</Label>
          <div>{prompt.description}</div>
        </div>
        <div className={"flex w-full flex-col space-y-1"}>
          <Label>AI prompt</Label>
          <div className={"bg-accent overflow-hidden rounded-md p-3"}>
            <ReactMarkdown className={"overflow-auto"}>
              {prompt.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className={"flex w-full flex-col space-y-6 text-sm"}>
          <Label>Try AI prompt with these large language models</Label>
          {Object.keys(modelsByProvider).map(provider => {
            return (
              <div key={provider} className={"grid grid-cols-3 gap-2"}>
                {modelsByProvider[provider as ModelProvider].map(model => {
                  return (
                    <div
                      className={"flex items-center space-x-1"}
                      key={model.modelId}
                    >
                      <ModelIcon
                        width={30}
                        height={30}
                        provider={model.provider}
                        modelId={model.modelId}
                      />
                      <div>
                        <span className={"text-foreground/70"}>
                          {model.provider}
                        </span>{" "}
                        / {model.modelName}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </PageContent>
  )
}
