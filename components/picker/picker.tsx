import { FC, useEffect, useRef } from "react"

interface PickerProps<T> {
  items: T[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  focusItem: T | null
  command: string
  handleSelectItem: (item: T) => void
  iconRenderer?: (item: T) => JSX.Element
  itemRenderer?: (
    item: T,
    index: number,
    handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  ) => JSX.Element
}

export const Picker: FC<PickerProps<any>> = ({
  items,
  isOpen,
  setIsOpen,
  focusItem,
  command,
  handleSelectItem,
  iconRenderer,
  itemRenderer
}) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(command.toLowerCase())
  )

  function defaultIconRenderer(item: any) {
    console.log(typeof item.icon)
    if (typeof item.icon === "string") {
      return (
        <div
          className={
            "border-foreground/10 flex size-[24px] items-center justify-center rounded border-[1px]"
          }
        >
          {item.icon}
        </div>
      )
    }
  }

  const renderIcon = iconRenderer || defaultIconRenderer

  // Default item renderer
  const defaultItemRenderer = (
    item: any,
    index: number,
    handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  ) => (
    <div
      key={index}
      tabIndex={0}
      className="hover:bg-accent focus:bg-accent flex h-[36px] cursor-pointer items-center space-x-2 rounded px-2 text-sm focus:outline-none"
      onClick={() => handleSelectItem(item)}
      onKeyDown={handleKeyDown}
    >
      <div>{renderIcon(item)}</div>
      <div className={"text-nowrap"}>{item.name}</div>
      <div className="truncate text-nowrap text-sm opacity-50">
        {item.description}
      </div>
    </div>
  )

  // Use the provided itemRenderer prop if it exists, otherwise use the default
  const renderItem = itemRenderer || defaultItemRenderer

  const getKeyDownHandler =
    (index: number, item: any) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
      } else if (e.key === "Backspace") {
        e.preventDefault()
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleSelectItem(item)
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredItems.length
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  return (
    <>
      {isOpen && (
        <div className="flex flex-col p-2 text-sm">
          {filteredItems.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching items.
            </div>
          ) : (
            filteredItems.map((item, index) =>
              renderItem(item, index, getKeyDownHandler(index, item))
            )
          )}
        </div>
      )}
    </>
  )
}
