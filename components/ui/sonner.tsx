"use client"

import {
  Alert02Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Cancel01Icon,
} from "hugeicons-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/components/providers"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckmarkCircle01Icon className="size-4" />,
        info: <InformationCircleIcon className="size-4" />,
        warning: <Alert02Icon className="size-4" />,
        error: <Cancel01Icon className="size-4" />,
        loading: <Loading03Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
