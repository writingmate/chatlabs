import "../(private)/globals.css"

export const metadata = {
  title: "ChatLabs",
  description: "Created with ChatLabs App Builder"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
