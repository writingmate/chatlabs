import { IconSearch } from "@tabler/icons-react"
import { Input } from "./input"

interface SearchInputProps {
  placeholder: string
  value: string
  className?: string
  onChange: (value: string) => void
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  className
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
