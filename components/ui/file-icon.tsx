import {
  IconFile,
  IconFileText,
  IconFileTypeCsv,
  IconFileTypeDocx,
  IconFileTypePdf,
  IconJson,
  IconMarkdown,
  IconPhoto
} from "@tabler/icons-react"
import { FC } from "react"

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
  if (type.includes("image")) {
    return <IconPhoto size={size} stroke={stroke} />
  } else if (type.includes("pdf")) {
    return <IconFileTypePdf size={size} stroke={stroke} />
  } else if (type.includes("csv")) {
    return <IconFileTypeCsv size={size} stroke={stroke} />
  } else if (type.includes("docx")) {
    return <IconFileTypeDocx size={size} stroke={stroke} />
  } else if (type.includes("plain")) {
    return <IconFileText size={size} stroke={stroke} />
  } else if (type.includes("json")) {
    return <IconJson size={size} stroke={stroke} />
  } else if (type.includes("markdown")) {
    return <IconMarkdown size={size} stroke={stroke} />
  } else {
    return <IconFile size={size} stroke={stroke} />
  }
}
