export function updateHtml(doc: Document) {
  try {
    // known valid css files to ignore
    const knownTailwind = "tailwindcss"
    const upgradeToTailwind = "https://cdn.tailwindcss.com?plugins=typography"
    const knownDaisyui = "daisyui"
    const upgradeToDaisyui =
      "https://cdn.jsdelivr.net/npm/daisyui@4.12.10/dist/full.min.css"

    const head = doc.getElementsByTagName("head")[0]
    let daisyuiStylesheet: HTMLLinkElement | null = null

    // replace daisyui with our own version if it in the document
    function replaceDaisyui(dom: Document) {
      const stylesheets = dom.getElementsByTagName("link")
      for (let i = 0; i < stylesheets.length; i++) {
        const stylesheet = stylesheets[i]
        if (stylesheet.getAttribute("rel") === "stylesheet") {
          if (stylesheet.getAttribute("href")?.includes(knownDaisyui)) {
            daisyuiStylesheet = stylesheet
            stylesheet.setAttribute("href", upgradeToDaisyui)
          }
        }
      }
    }

    function replaceTailwind(dom: Document) {
      const stylesheets = dom.getElementsByTagName("link")
      const scripts = dom.getElementsByTagName("script")
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i]
        if (script.getAttribute("src")?.includes(knownTailwind)) {
          script.setAttribute("src", upgradeToTailwind)
          if (daisyuiStylesheet) {
            head.insertBefore(script, daisyuiStylesheet.nextSibling)
          } else {
            head.insertBefore(script, head.firstChild)
          }
        }
      }
      for (let i = 0; i < stylesheets.length; i++) {
        const stylesheet = stylesheets[i]
        if (stylesheet.getAttribute("href")?.includes(knownTailwind)) {
          const tailwindScriptElement = doc.createElement("script")
          tailwindScriptElement.setAttribute("src", upgradeToTailwind)
          // Remove the stylesheet from its parent node
          stylesheet.parentNode?.removeChild(stylesheet)
          if (daisyuiStylesheet) {
            head.insertBefore(
              tailwindScriptElement,
              daisyuiStylesheet.nextSibling
            )
          } else {
            head.insertBefore(tailwindScriptElement, head.firstChild)
          }
        }
      }
    }

    function replaceLinks(dom: Document) {
      const links = dom.getElementsByTagName("a")
      for (let i = 0; i < links.length; i++) {
        const link = links[i]
        link.setAttribute("rel", "nofollow")
        if (link.getAttribute("href")?.startsWith("#")) {
          link.setAttribute("href", `about:srcdoc${link.getAttribute("href")}`)
        }
      }
    }

    function addCustomStyles(doc: Document) {
      if (typeof window === "undefined") {
        const DOMParser = require("@xmldom/xmldom").DOMParser
        const parser = new DOMParser()
        const styleElement = parser.parseFromString(
          `
            <style>
body, html {
  min-width: 100vw;
  min-height: 100vh;
}
  </style>
    `,
          "text/html"
        )

        head.appendChild(styleElement)
      } else {
        const styleElement = doc.createElement("style")
        styleElement.textContent = `
                body, html {
                  min-width: 100vw;
                  min-height: 100vh;
                }
                `
        head.appendChild(styleElement)
      }
    }

    replaceDaisyui(doc)
    replaceTailwind(doc)
    replaceLinks(doc)
    addCustomStyles(doc)

    return doc
  } catch (e) {
    console.error("Unable to parse dom, returning html as is", e)
    return doc
  }
}
