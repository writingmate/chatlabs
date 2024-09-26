import React, { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { generateImage, GenerateImageParams } from "./image-api"
import { LoadingSVG } from "@/components/icons/loading-svg"
import ImageCard from "./ImageCard"
import ParameterPanel from "./ParameterPanel"
import { Alert } from "../ui/alert"

const TextToImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // Parameters
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [resolution, setResolution] = useState("1024x768")
  const [style, setStyle] = useState("Realistic")
  const [numberOfImages, setNumberOfImages] = useState(1)
  const [guidanceScale, setGuidanceScale] = useState(7.5)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate an image.")
      return
    }
    setIsGenerating(true)
    setError(null)
    setSuccess(false)
    setGeneratedImages([])

    try {
      const params: GenerateImageParams = {
        aspectRatio,
        resolution,
        style,
        numberOfImages,
        guidanceScale
      }

      // Generate images concurrently based on the numberOfImages
      const imagePromises = Array.from({ length: numberOfImages }).map(() =>
        generateImage(prompt, params)
      )

      const images = await Promise.all(imagePromises)
      setGeneratedImages(images)
      setSuccess(true)
    } catch (err) {
      console.error("Error generating images:", err)
      setError("Failed to generate images. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      {/* Left Sidebar - Parameter Panel */}
      <div className="w-80 overflow-y-auto bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-white">Text to Image</h2>

        {/* Display Success or Error Messages */}
        {/* {error && <Alert type="error" message={error} />} */}
        {/* {success && <Alert type="success" message={"Images generated successfully!"} />} */}

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className="h-32 w-full resize-none rounded-lg border border-gray-600 bg-gray-700 p-3 text-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your image. Get creative..."
          />
        </div>

        {/* Parameter Panel */}
        <ParameterPanel
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          resolution={resolution}
          setResolution={setResolution}
          style={style}
          setStyle={setStyle}
          numberOfImages={numberOfImages}
          setNumberOfImages={setNumberOfImages}
          guidanceScale={guidanceScale}
          setGuidanceScale={setGuidanceScale}
        />

        {/* Generate Button */}
        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <LoadingSVG />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Area - Display Images */}
      <div className="flex-1 overflow-auto p-6">
        <h3 className="mb-4 text-2xl font-semibold text-white">
          Generated Images
        </h3>
        {isGenerating && (
          <div className="flex h-full items-center justify-center">
            <LoadingSVG />
          </div>
        )}
        {!isGenerating && generatedImages.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {generatedImages.map((url, index) => (
              <ImageCard
                key={index}
                src={url}
                alt={`Generated Image ${index + 1}`}
              />
            ))}
          </div>
        )}
        {!isGenerating && generatedImages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>
              No images generated yet. Enter a prompt and click
              &quot;Generate&quot; to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextToImageGenerator
