import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        info: "border-blue-500/50 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-950/50 dark:text-blue-300 [&>svg]:text-blue-700 dark:[&>svg]:text-blue-300",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive/30 dark:text-destructive/90 [&>svg]:text-destructive dark:[&>svg]:text-destructive/90 bg-destructive/10",
        warning:
          "border-yellow-500/50 bg-yellow-50 text-yellow-700 dark:border-yellow-400/30 dark:bg-yellow-950/50 dark:text-yellow-300 [&>svg]:text-yellow-700 dark:[&>svg]:text-yellow-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

const Callout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof calloutVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(calloutVariants({ variant }), className)}
    {...props}
  />
))
Callout.displayName = "Callout"

const CalloutIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("size-4", className)}
    {...props}
  />
))
CalloutIcon.displayName = "CalloutIcon"

const CalloutTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
CalloutTitle.displayName = "CalloutTitle"

const CalloutDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
CalloutDescription.displayName = "CalloutDescription"

export { Callout, CalloutIcon, CalloutTitle, CalloutDescription }
