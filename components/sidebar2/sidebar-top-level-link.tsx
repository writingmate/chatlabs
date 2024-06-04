import { ContentType } from "@/types"
import Link from "next/link"

type SidebarSwitchItemProps = {
  icon: React.ReactNode
  folders?: any
  href: string
  label: string
  // active: boolean
}

export function SidebarTopLevelLink({
  icon,
  href,
  label
}: SidebarSwitchItemProps) {
  return (
    <Link
      prefetch={true}
      href={href}
      className={
        "hover:bg-accent/60 flex-start focus:bg-accent group flex h-[36px] w-full cursor-pointer items-center rounded px-2 focus:outline-none"
      }
    >
      {icon}
      <div className={"ml-3 flex-1 truncate text-left text-sm"}>{label}</div>
    </Link>
  )
}
