import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // 主要操作：青
        default:
          "bg-[#1568c8] text-white hover:bg-[#1050a8] focus-visible:ring-blue-400/40 border border-[#1568c8] hover:border-[#1050a8]",
        // 危険操作：赤
        destructive:
          "bg-[#c0001a] text-white hover:bg-[#a00016] border border-[#c0001a] hover:border-[#a00016] focus-visible:ring-red-400/40",
        // 補助操作：アウトライン
        outline:
          "border border-[#c8d4e0] bg-white text-[#1a2535] hover:bg-[#f0f4f8] hover:border-[#9ab0c8]",
        // 補助操作：グレー塗り
        secondary:
          "bg-[#e8edf3] text-[#1a2535] border border-[#c8d4e0] hover:bg-[#d8e0ea] hover:border-[#9ab0c8]",
        ghost:
          "text-[#1a2535] hover:bg-[#e8edf3]",
        link: "text-[#1568c8] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-md px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-md px-7 text-base has-[>svg]:px-5",
        icon: "size-11",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
