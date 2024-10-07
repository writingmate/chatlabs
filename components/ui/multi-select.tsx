import { FC, useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  IconCheck,
  IconChevronDown,
  IconCircleCheckFilled
} from "@tabler/icons-react"
import React from "react"
import { IconCircleCheck } from "@tabler/icons-react"

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
  footer?: React.ReactNode
}

interface ModelOption {
  value: string
  label: string
}

export const defaultRenderOption = (
  option: ModelOption,
  selected: boolean,
  onSelect: () => void
) => (
  <div
    key={option.value}
    className={`hover:bg-primary/5 flex cursor-pointer items-center justify-between p-1 px-3`}
    onClick={onSelect}
  >
    <span>{option.label}</span>
    {selected && <IconCheck className="text-primary" size={20} />}
  </div>
)

export const MultiSelect: FC<MultiSelectProps<ModelOption>> = ({
  options,
  selectedOptions,
  onChange,
  renderOption = defaultRenderOption,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  footer = null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [internalSelectedOptions, setInternalSelectedOptions] =
    useState<ModelOption[]>(selectedOptions)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSelect = (option: ModelOption) => {
    if (
      internalSelectedOptions.some(selected => selected.value === option.value)
    ) {
      setInternalSelectedOptions(
        internalSelectedOptions.filter(item => item.value !== option.value)
      )
    } else {
      setInternalSelectedOptions([...internalSelectedOptions, option])
    }
  }

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
        if (!isOpen) {
          onChange(internalSelectedOptions)
        }
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
          <IconChevronDown
            size={18}
            stroke={1.5}
            className="size-4 opacity-50"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        style={{ width: triggerRef.current?.offsetWidth }}
        className="overflow-auto p-0 text-sm"
        align="start"
      >
        <div className={`py-2 ${footer ? "pb-0" : ""}`}>
          <div className="mb-2 px-2">
            <Input
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {options
              .filter(option =>
                option.value?.toLowerCase().includes(search.toLowerCase())
              )
              .map(option =>
                renderOption(
                  option,
                  internalSelectedOptions.some(
                    selected => selected.value === option.value
                  ),
                  () => handleSelect(option)
                )
              )}
          </div>
        </div>

        {footer && <div className="sticky bottom-0 border-t">{footer}</div>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
