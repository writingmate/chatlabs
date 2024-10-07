import { PlatformTool, ToolFunction } from "@/types/platformTools"

export abstract class BaseTool {
  protected constructor(
    protected readonly name: string,
    protected readonly id: string,
    protected readonly toolName: string,
    protected readonly description: string,
    protected readonly version: string = "v1.0.0"
  ) {}

  protected abstract getToolFunctions(): ToolFunction[]

  public createPlatformTool(): PlatformTool {
    return {
      id: this.id,
      name: this.name,
      toolName: this.toolName,
      version: this.version,
      description: this.description,
      toolsFunctions: this.getToolFunctions()
    }
  }
}
