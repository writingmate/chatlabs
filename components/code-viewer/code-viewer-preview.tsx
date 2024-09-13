import React, { FC, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { IconClick, IconX, IconWand } from "@tabler/icons-react"

interface PreviewProps {
  uniqueIFrameId: string
  value: string
  language: string
  inspectMode: boolean
  setInspectMode: (inspectMode: boolean) => void
  handleFixError: (error: string) => void // New prop for handling error fixes
}

export const CodeViewerPreview: FC<PreviewProps> = ({
  uniqueIFrameId,
  value,
  language,
  inspectMode,
  setInspectMode,
  handleFixError
}) => {
  const [consoleMessages, setConsoleMessages] = useState<
    { message: string; level: string }[]
  >([])

  const consoleScript = `
    <script>
      (function() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
          window.parent.postMessage({ type: "console", message: args.join(" "), level: "log", iframeId: "${uniqueIFrameId}" }, "*");
          originalLog.apply(console, args);
        };
        
        console.error = function(...args) {
          window.parent.postMessage({ type: "console", message: args.join(" "), level: "error", iframeId: "${uniqueIFrameId}" }, "*");
          originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
          window.parent.postMessage({ type: "console", message: args.join(" "), level: "warn", iframeId: "${uniqueIFrameId}" }, "*");
          originalWarn.apply(console, args);
        };
      })();
    </script>
  `

  const highlightScript = `
    <script>
      let inspectModeEnabled = ${inspectMode ? "true" : "false"};
      
      function initializeHighlighting() {
        function getXPath(element) {
          if (element.id !== "") return 'id("' + element.id + '")';
          if (element === document.body) return element.tagName.toLowerCase();
          var ix = 0;
          var siblings = element.parentNode.childNodes;
          for (var i = 0; i < siblings.length; i++) {
            var sibling = siblings[i];
            if (sibling === element) {
              return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
              ix++;
            }
          }
        }
        document.body.addEventListener('mouseover', function(event) {
          if (!inspectModeEnabled) return;
          const target = event.target;
          target.style.outline = '1px dashed blue';
        });
        document.body.addEventListener('mouseout', function(event) {
          if (!inspectModeEnabled) return;
          const target = event.target;
          target.style.outline = '';
        });
        document.body.addEventListener('click', function(event) {
          if (!inspectModeEnabled) return;
          event.preventDefault();
          const xpath = getXPath(event.target);
          window.parent.postMessage({
            type: 'elementClicked',
            xpath: xpath,
            innerText: event.target.innerText
          }, '*');
        });
      }
      window.addEventListener('message', function(event) {
        if (event.data.type === 'toggleInspectMode') {
          inspectModeEnabled = event.data.enabled;
        }
      });
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHighlighting);
      } else {
        initializeHighlighting();
      }
    </script>
  `

  function addScriptsToHtml(html: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const body = doc.querySelector("body")
    if (body) {
      body.innerHTML = [body.innerHTML, consoleScript, highlightScript].join("")
    }
    return doc.documentElement.outerHTML
  }

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (
        event.data.type === "console" &&
        event.data.iframeId === uniqueIFrameId
      ) {
        setConsoleMessages(prevMessages => [
          ...prevMessages,
          { message: event.data.message, level: event.data.level }
        ])
      }
    }
    window.addEventListener("message", receiveMessage)
    return () => {
      window.removeEventListener("message", receiveMessage)
    }
  }, [uniqueIFrameId])

  const hasErrors = consoleMessages.some(msg => msg.level === "error")

  return (
    <>
      <iframe
        data-id={uniqueIFrameId}
        className={"size-full min-h-[480px] border-none bg-white"}
        srcDoc={
          language === "html"
            ? addScriptsToHtml(value)
            : `<html lang="en"><body>${consoleScript}<script>${value}</script></body></html>`
        }
      />
      <div className="absolute right-3 top-2 flex items-center space-x-2">
        <WithTooltip
          display={
            "Inspect mode toggles highlighting of elements on the page. Click on an element to select and edit specific element."
          }
          trigger={
            <Button
              size={"icon"}
              className={"rounded-full"}
              variant={inspectMode ? "default" : "outline"}
              onClick={() => setInspectMode(!inspectMode)}
            >
              <IconClick stroke={1.5} />
            </Button>
          }
        />
      </div>
      {consoleMessages.length > 0 && (
        <div className="z-10 max-h-[200px] w-full overflow-auto bg-gray-100 px-3 py-2 text-sm text-gray-800">
          <div className="flex h-6 items-center justify-between gap-1">
            <span>Console</span>
            <div className="flex items-center space-x-2">
              {hasErrors && (
                <Button
                  size={"xs"}
                  variant={"outline"}
                  onClick={() =>
                    handleFixError(
                      consoleMessages.find(msg => msg.level === "error")
                        ?.message || ""
                    )
                  }
                  className="text-gray-800 hover:opacity-50"
                >
                  <IconWand size={16} />
                </Button>
              )}
              <Button
                size={"xs"}
                variant={"outline"}
                onClick={() => setConsoleMessages([])}
                className="text-gray-800 hover:opacity-50"
              >
                <IconX size={16} />
              </Button>
            </div>
          </div>
          <div className="margin-0 relative whitespace-pre-wrap bg-gray-100 font-mono text-xs text-gray-800">
            {consoleMessages.map((msg, index) => (
              <div key={index}>
                <strong>[{msg.level.toUpperCase()}]</strong> {msg.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
