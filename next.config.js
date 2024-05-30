const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true"
})

const withPWA = require("next-pwa")({
    dest: "public"
})

module.exports = withBundleAnalyzer(
    withPWA({
        async rewrites() {
            return [
                {
                    source: '/a/:id',
                    destination: '/assistants/:id',
                },
            ]
        },
        reactStrictMode: true,
        images: {
            // unoptimized: true,
            remotePatterns: [
                {
                    protocol: "http",
                    hostname: "localhost"
                },
                {
                    protocol: "http",
                    hostname: "127.0.0.1"
                },
                {
                    protocol: "https",
                    hostname: "**"
                }
            ]
        },
        experimental: {
            serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
        }
    })
)
