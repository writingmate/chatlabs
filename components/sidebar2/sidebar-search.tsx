import { ContentType } from "@/types"
import { FC, useState } from "react"
import { Input } from "../ui/input"
import { IconSearch } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface SidebarSearchProps {
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  const [hasFocus, setHasFocus] = useState(false)

  return (
    <div
      className={cn(
        "bg-background focus:border-input hover:border-input focus:bg-accent group z-50 mt-2 flex h-[32px] w-full cursor-pointer items-center rounded-md border border-transparent px-2 py-1",
        hasFocus && "border-input"
      )}
    >
      <IconSearch size={20} stroke={1.5} />
      <div className={"ml-3 flex-1 truncate text-sm"}>
        <Input
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={"Search"}
          className={"z-30 -ml-2 h-auto border-transparent px-2 py-0.5"}
        />
      </div>
    </div>
  )
}
