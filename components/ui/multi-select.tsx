import { FC, useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { IconChevronDown, IconCircleCheckFilled } from "@tabler/icons-react"

interface MultiSelectProps<T> {
  options: T[]
  selectedOptions: T[]
  onChange: (selected: T[]) => void
  renderOption?: (
    option: T,
    selected: boolean,
    onSelect: () => void
  ) => JSX.Element
  placeholder?: string
  searchPlaceholder?: string
}

interface ModelOption {
  value: string
  label: string
}

const defaultRenderOption = (
  option: ModelOption,
  selected: boolean,
  onSelect: () => void
) => (
  <div
    key={option.value}
    className={`hover:bg-primary/5 flex cursor-pointer items-center justify-between p-1`}
    onClick={onSelect}
  >
    <span>{option.label}</span>
    {selected && <IconCircleCheckFilled className="text-primary" size={20} />}
  </div>
)

export const MultiSelect: FC<MultiSelectProps<ModelOption>> = ({
  options,
  selectedOptions,
  onChange,
  renderOption = defaultRenderOption,
  placeholder = "Select options",
  searchPlaceholder = "Search..."
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSelect = (option: ModelOption) => {
    if (selectedOptions.some(selected => selected.value === option.value)) {
      onChange(selectedOptions.filter(item => item.value !== option.value))
    } else {
      onChange([...selectedOptions, option])
    }
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-background w-full justify-start border px-3 py-5"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center truncate text-sm font-normal">
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
          </div>
          <IconChevronDown size={18} className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="space-y-2 overflow-auto p-2"
        align="start"
      >
        <Input
          ref={inputRef}
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.stopPropagation()}
        />

        {options
          .filter(option =>
            option.value?.toLowerCase().includes(search.toLowerCase())
          )
          .map(option =>
            renderOption(
              option,
              selectedOptions.some(selected => selected.value === option.value),
              () => handleSelect(option)
            )
          )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
