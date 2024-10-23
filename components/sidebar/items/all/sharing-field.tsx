import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function SharingField({
  value,
  onChange
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex-start flex flex-col space-y-1 pt-2">
      <Label>Permissions</Label>
      <ToggleGroup
        className={"justify-start"}
        variant={"outline"}
        value={value}
        onValueChange={onChange}
        type={"single"}
      >
        <ToggleGroupItem value={"public"}>Public</ToggleGroupItem>
        <ToggleGroupItem value={"private"}>Private</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
