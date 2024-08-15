// components/ImageGallery.js
"use client"

import { useState } from "react"

const ITEMS_PER_PAGE = 9

const ImageGallery = ({
  initialImages,
  initialTotalPages,
  fetchImages
}: {
  initialImages: string[]
  initialTotalPages: number
  fetchImages: (
    searchTerm: string,
    page: number
  ) => Promise<{ data: string[]; count: number }>
}) => {
  const [images, setImages] = useState(initialImages)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)

  const handleSearch = async (e: any) => {
    const term = e.target.value
    setSearchTerm(term)
    setPage(1) // Reset to first page on new search

    const { data, count } = await fetchImages(term, 1)
    setImages(data)
    setTotalPages(Math.ceil(count / ITEMS_PER_PAGE))
  }

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)

    const { data } = await fetchImages(searchTerm, newPage)
    setImages(data)
  }

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 rounded border border-gray-300 p-2"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((url, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-lg">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="mx-1 rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">{`Page ${page} of ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="mx-1 rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default ImageGallery
