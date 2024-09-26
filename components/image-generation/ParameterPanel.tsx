import React from "react"
import { FiHelpCircle } from "react-icons/fi"

interface ParameterPanelProps {
  aspectRatio: string
  setAspectRatio: (value: string) => void
  resolution: string
  setResolution: (value: string) => void
  style: string
  setStyle: (value: string) => void
  numberOfImages: number
  setNumberOfImages: (value: number) => void
  guidanceScale: number
  setGuidanceScale: (value: number) => void
}

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  style,
  setStyle,
  numberOfImages,
  setNumberOfImages,
  guidanceScale,
  setGuidanceScale
}) => {
  return (
    <div className="space-y-6">
      {/* Aspect Ratio */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Aspect Ratio
        </label>
        <select
          value={aspectRatio}
          onChange={e => setAspectRatio(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="1:1">1:1</option>
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="21:9">21:9</option>
        </select>
      </div>

      {/* Resolution */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Resolution
        </label>
        <select
          value={resolution}
          onChange={e => setResolution(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="512x512">512x512</option>
          <option value="768x768">768x768</option>
          <option value="1024x768">1024x768</option>
        </select>
      </div>

      {/* Style */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Style
        </label>
        <select
          value={style}
          onChange={e => setStyle(e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="Realistic">Realistic</option>
          <option value="Cartoon">Cartoon</option>
          <option value="Abstract">Abstract</option>
          <option value="Surreal">Surreal</option>
        </select>
      </div>

      {/* Number of Images */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Number of Images
        </label>
        <input
          type="number"
          min={1}
          max={4}
          value={numberOfImages}
          onChange={e => setNumberOfImages(parseInt(e.target.value) || 1)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-gray-200 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Guidance Scale */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-300">
          Guidance Scale
        </label>
        <div className="flex items-center">
          <input
            type="range"
            min={1}
            max={10}
            step={0.1}
            value={guidanceScale}
            onChange={e => setGuidanceScale(parseFloat(e.target.value))}
            className="flex-1 bg-gray-700 accent-blue-500"
          />
          <span className="ml-3 text-gray-200">{guidanceScale}</span>
          <FiHelpCircle
            className="ml-2 text-gray-400"
            title="Higher values produce more accurate images based on the prompt."
          />
        </div>
      </div>
    </div>
  )
}

export default ParameterPanel
