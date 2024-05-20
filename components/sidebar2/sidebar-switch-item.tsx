import { ContentType } from "@/types"
import Link from "next/link"

type SidebarSwitchItemProps = {
  icon: React.ReactNode
  contentType: ContentType
  folders?: any
  label: string
  // active: boolean
}

export function SidebarSwitchItem({
  icon,
  contentType,
  label
}: SidebarSwitchItemProps) {
  return (
    <Link
      href={`./${contentType}`}
      className={
        "hover:bg-accent/60 flex-start focus:bg-accent group flex h-[36px] w-full cursor-pointer items-center rounded px-2 focus:outline-none"
      }
    >
      {icon}
      <div className={"ml-3 flex-1 truncate text-left text-sm"}>{label}</div>
    </Link>
  )
}
