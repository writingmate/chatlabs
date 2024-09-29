import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        info: "border-blue-500/50 bg-blue-100 text-blue-700 dark:border-blue-500 [&>svg]:text-blue-700",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-yellow-500/50 bg-yellow-100 text-yellow-700 dark:border-yellow-500 [&>svg]:text-yellow-700"
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
