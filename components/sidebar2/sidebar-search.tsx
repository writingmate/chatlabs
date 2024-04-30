import { ContentType } from "@/types"
import { FC } from "react"
import { Input } from "../ui/input"
import { IconSearch } from "@tabler/icons-react"

interface SidebarSearchProps {
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div
      className={
        "focus:border-input hover:border-input focus:bg-accent group mt-2 flex w-full cursor-pointer items-center rounded-md border border-transparent px-2 py-1"
      }
    >
      <IconSearch size={20} stroke={1.5} />
      <div className={"ml-3 flex-1 truncate text-sm"}>
        <Input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={"Search"}
          className={"z-30 -ml-2 h-auto border-transparent px-2 py-0.5"}
        />
      </div>
    </div>
  )
}
