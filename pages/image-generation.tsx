import React from "react"
import TextToImageGenerator from "@/components/image-generation/text-to-image-generator"
import Sidebar from "@/components/layout/sidebar" // Include if you want the sidebar on this page

const ImageGenerationPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Optional Sidebar */}
      <Sidebar />{" "}
      {/* Remove this line if you don't want the sidebar on the image generation page */}
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <TextToImageGenerator />
      </div>
    </div>
  )
}

export default ImageGenerationPage
