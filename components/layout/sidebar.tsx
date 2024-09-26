import { useState } from "react"
import TextToImageGenerator from "../image-generation/text-to-image-generator"
import { useRouter } from "next/router" // Import useRouter for navigation

const Sidebar = () => {
  const router = useRouter() // Initialize useRouter

  return (
    <div className="sidebar">
      {/* ... existing sidebar buttons ... */}

      {/* Text to Image Button */}
      <button
        onClick={() => router.push("/image-generation")}
        className="btn-sidebar"
      >
        Text to Image
      </button>

      {/* Remove the following block if not needed */}
      {/* {showImageGenerator && (
        <TextToImageGenerator onClose={() => setShowImageGenerator(false)} />
      )} */}
    </div>
  )
}

export default Sidebar
