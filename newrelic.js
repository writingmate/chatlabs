"use strict"
exports.config = {
  app_name: [
    "chatlabs-" + (process.env.NODE_ENV === "production" ? "production" : "dev")
  ],
  license_key: "55d6b1b49b413c59d46c7c0980dbf017FFFFNRAL",
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
