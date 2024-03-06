"use client"
import { getPublicAssistants } from "@/db/assistants"
import { getPublicPrompts } from "@/db/prompts"
import { Tables } from "@/supabase/types"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { supabase } from "@/lib/supabase/browser-client"
import { IconRobotFace } from "@tabler/icons-react"

export default function CatalogPage() {
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])

  useEffect(() => {
    ;(async () => {
      const assistants = await getPublicAssistants()
      const prompts = await getPublicPrompts()

      setAssistants(assistants)
      setPrompts(prompts)
    })()
  }, [])

  return (
    <div className="container-xl flex size-full flex-col items-center justify-center sm:max-w-2xl">
      <Tabs>
        <TabsList className="mt-4 grid w-full grid-cols-2">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="assistants">Assistants</TabsTrigger>
        </TabsList>
        <TabsContent value={"prompts"}>
          {prompts.map(item => (
            <Card key={item.id}>
              <div>
                <div className={"text-md font-semibold"}>{item.name}</div>
                <div className={"line-clamp-3 text-ellipsis text-xs"}>
                  {item.content}
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value={"assistants"}>
          <div className={"grid grid-cols-2 gap-4"}>
            {assistants.map(item => (
              <Card
                key={item.id}
                className={
                  "hover:bg-foreground/5 flex items-center space-x-2 rounded-2xl p-4 hover:cursor-pointer"
                }
              >
                <div className={"w-[60px]"}>
                  {item.image_path ? (
                    <Image
                      className={"rounded-xl"}
                      src={
                        supabase.storage
                          .from("assistant_images")
                          .getPublicUrl(item.image_path).data.publicUrl
                      }
                      alt={item.name}
                      width={40}
                      height={40}
                    />
                  ) : (
                    <IconRobotFace size={40} />
                  )}
                </div>
                <div>
                  <div className={"text-sm font-semibold"}>{item.name}</div>
                  <div className={"line-clamp-3 text-ellipsis text-xs"}>
                    {item.description}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
