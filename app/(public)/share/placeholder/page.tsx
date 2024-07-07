"use client"
import Loading from "@/components/ui/loading"

export default function PlaceholderPage() {
  return (
    <div className="size-screen flex size-full flex-col items-center justify-center font-sans">
      <div className="text-center text-2xl">
        <Loading />
        <div>
          Please give us a moment. <br /> Your app is being prepared. <br />{" "}
          This page will automatically refresh when it{"'"}s ready.
        </div>
      </div>
    </div>
  )
}
