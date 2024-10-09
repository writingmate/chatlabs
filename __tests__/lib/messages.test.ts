import { parseCodeBlocksAndContent } from "@/lib/messages"

describe("parseCodeBlocksAndContent", () => {
  it("should parse a string with no code blocks correctly", () => {
    const input = "This is a simple text without code blocks."
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({ parsedContent: input, codeBlocks: [] })
  })

  it("should parse a string with a single code block correctly", () => {
    const input =
      "Here is some code:\n```js\nconsole.log('Hello, world!');\n```"
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({
      parsedContent: "Here is some code:\n[CODE_BLOCK_0]",
      codeBlocks: [
        {
          language: "js",
          code: "console.log('Hello, world!');",
          messageId: "1",
          sequenceNo: 0
        }
      ]
    })
  })

  it("should parse a string with multiple code blocks correctly", () => {
    const input =
      "Text before code.\n```python\nprint('Hello')\n```\nMore text.\n```html\n<div>Hello</div>\n```"
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({
      parsedContent:
        "Text before code.\n[CODE_BLOCK_0]\nMore text.\n[CODE_BLOCK_1]",
      codeBlocks: [
        {
          language: "python",
          code: "print('Hello')",
          messageId: "1",
          sequenceNo: 0
        },
        {
          language: "html",
          code: "<div>Hello</div>",
          messageId: "1",
          sequenceNo: 1
        }
      ]
    })
  })

  it("should handle code blocks without a specified language", () => {
    const input = "Code without language:\n```\nSELECT * FROM users;\n```"
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({
      parsedContent: "Code without language:\n[CODE_BLOCK_0]",
      codeBlocks: [
        {
          language: "",
          filename: undefined,
          code: "SELECT * FROM users;",
          messageId: "1",
          sequenceNo: 0
        }
      ]
    })
  })

  it("should handle empty input", () => {
    const input = ""
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({ parsedContent: input, codeBlocks: [] })
  })

  it("should handle unfinished code blocks correctly", () => {
    const input =
      "Here is an unfinished code block:\n```js\nconsole.log('Hello, world!')"
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({
      parsedContent: "Here is an unfinished code block:\n[CODE_BLOCK_0]",
      codeBlocks: [
        {
          language: "js",
          filename: undefined,
          code: "console.log('Hello, world!')",
          messageId: "1",
          sequenceNo: 0
        }
      ]
    })
  })

  it("should handle unfinished code blocks correctly 2", () => {
    const input =
      "Here is an unfinished code block:\n```\nconsole.log('Hello, world!')"
    const result = parseCodeBlocksAndContent(input, "1")
    expect(result).toEqual({
      parsedContent: "Here is an unfinished code block:\n[CODE_BLOCK_0]",
      codeBlocks: [
        {
          language: "",
          filename: undefined,
          code: "console.log('Hello, world!')",
          messageId: "1",
          sequenceNo: 0
        }
      ]
    })
  })
})
