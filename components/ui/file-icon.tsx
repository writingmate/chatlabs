import { FC } from "react"
import {
  IconFile,
  IconFileText,
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypeHtml,
  IconFileTypePdf,
  IconJson,
  IconMarkdown,
  IconPhoto
} from "@tabler/icons-react"

interface FileIconProps {
  type: string
  size?: number
  stroke?: number
}

export const FileIcon: FC<FileIconProps> = ({
  type,
  size = 32,
  stroke = 1.5
}) => {
  const iconProps = { size, stroke, className: "text-muted-foreground" }

  if (type.includes("image")) {
    return <IconPhoto {...iconProps} />
  } else if (type.includes("pdf")) {
    return <IconFileTypePdf {...iconProps} />
  } else if (type.includes("csv")) {
    return <IconFileTypeCsv {...iconProps} />
  } else if (type.includes("docx")) {
    return <IconFileTypeDocx {...iconProps} />
  } else if (type.includes("plain")) {
    return <IconFileText {...iconProps} />
  } else if (type.includes("json")) {
    return <IconJson {...iconProps} />
  } else if (type.includes("markdown")) {
    return <IconMarkdown {...iconProps} />
  } else if (type.includes("html")) {
    return <IconFileTypeHtml {...iconProps} />
  } else {
    return <IconFile {...iconProps} />
  }
}
