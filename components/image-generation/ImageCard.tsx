import React from "react"
import { FiDownload, FiZoomIn } from "react-icons/fi"

interface ImageCardProps {
  src: string
  alt: string
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-800 shadow-md">
      <img src={src} alt={alt} className="h-64 w-full object-cover" />
      <div className="flex justify-end space-x-2 p-2">
        <a href={src} download className="text-blue-500 hover:text-blue-400">
          <FiDownload size={20} />
        </a>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <FiZoomIn size={20} />
        </a>
      </div>
    </div>
  )
}

export default ImageCard
