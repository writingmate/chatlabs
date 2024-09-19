const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

const nrExternals = require('newrelic/load-externals')

const withPWA = require("next-pwa")({
  dest: "public"
})

const newrelicConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node", "newrelic"]
  },
  webpack: (config) => {
    nrExternals(config)
    return config
  }
};

const nextConfig = {
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
}

module.exports = {
  ...(withBundleAnalyzer(process.env.NODE_ENV === "production" ? withPWA(nextConfig) : nextConfig)),
  ...newrelicConfig
};
