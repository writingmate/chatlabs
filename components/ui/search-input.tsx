import { IconLoader, IconSearch } from "@tabler/icons-react"
import { Input } from "./input"

interface SearchInputProps {
  placeholder: string
  loading?: boolean
  value: string
  className?: string
  onChange: (value: string) => void
}

export function SearchInput({
  placeholder,
  loading = false,
  value,
  onChange,
  className
}: SearchInputProps) {
  return (
    <div
      className={`border-input bg-background flex items-center rounded-md border ${className}`}
    >
      {loading && (
        <IconLoader className="text-muted-foreground ml-3 size-5 animate-spin" />
      )}
      {!loading && (
        <IconSearch className={"text-muted-foreground ml-3 size-5"} />
      )}
      <Input
        placeholder={placeholder}
        value={value}
        className="border-none"
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
