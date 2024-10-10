"use strict"
exports.config = {
  app_name: [
    "imogenai.app-" + (process.env.NODE_ENV === "production" ? "production" : "dev")
  ],
  license_key: "3a9ee49b6e0cf9015d700b09ab96e77cFFFFNRAL",
  logging: {
    level: "info"
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
      "response.headers.x*"
    ]
  }
}
