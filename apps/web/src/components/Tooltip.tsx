import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import theme from '../theme'

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ children, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    style={{
      zIndex: 50,
      overflow: 'hidden',
      borderRadius: '6px',
      backgroundColor: theme.bg.elevated,
      padding: '6px 12px',
      fontSize: '12px',
      lineHeight: '16px',
      color: theme.text.primary,
      boxShadow: theme.effects.shadowLarge,
      border: `1px solid ${theme.border.subtle}`,
      animation: 'fadeIn 0.2s ease-out',
    }}
    {...props}
  >
    {children}
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

interface TooltipProps {
  children: React.ReactNode
  content: string
  side?: "top" | "right" | "bottom" | "left"
  delayDuration?: number
}

export function Tooltip({ children, content, side = "top", delayDuration = 300 }: TooltipProps) {
  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  )
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }

