import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Annotation } from "@/types/annotation"
import { useState } from "react"

export function WebSearch({ annotation }: { annotation: Annotation }) {
  const { organic } = annotation.webScraper__googleSearch!
  const [showAll, setShowAll] = useState(false)
  const organicLength = organic.length

  return (
    <div className={"grid grid-cols-4 gap-2 pb-4"}>
      {(showAll ? organic : organic.slice(0, 4)).map((item, index) => {
        const hostname = new URL(item.link).hostname
        return (
          <Card className={"flex border-0 hover:opacity-50"} key={index}>
            <a className="p-2 text-xs" href={item.link} target={"_blank"}>
              <div className={"flex space-x-1"}>
                <div className="bg-background text-background flex size-[16px] items-center justify-center rounded-full text-[10px]">
                  <Image
                    src={
                      "https://www.google.com/s2/favicons?size=64&domain=" +
                      hostname
                    }
                    alt={hostname}
                    width={16}
                    height={16}
                  />
                </div>
                <div className="text-xs font-semibold">
                  {hostname.replace("www.", "")}
                </div>
              </div>
              <div className="text-xs">{item.title}</div>
            </a>
          </Card>
        )
      })}
      {!showAll && (
        <a
          href={"#"}
          onClick={() => setShowAll(true)}
          className="col col-span-4 w-full text-right text-xs font-semibold underline hover:opacity-50"
        >
          Show {organic.length - 4} more
        </a>
      )}
    </div>
  )
}
