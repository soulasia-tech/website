"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-2 flex h-9 items-center justify-center z-20",
    caption_label: "text-base font-medium text-[#101828]",
    nav: "absolute top-0 flex w-full justify-between z-10",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-10 text-[#101828] hover:text-foreground p-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-10 text-[#101828] hover:text-foreground p-0",
    ),
    weekday: "size-9 p-0 text-xs font-normal text-[#4A4F5B]",
    day_button: cn(
      "relative flex size-6.5 items-center justify-center whitespace-nowrap",
      "rounded-lg p-0 text-foreground outline-offset-2",
      "focus:outline-none focus-visible:z-10 focus-visible:outline",
      "focus-visible:outline-2 focus-visible:outline-ring/70",

      "group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow]",
      "group-[[data-selected]:not(.range-middle)]:duration-150",
      "group-[[data-selected]:not(.range-middle)]:text-white",

      "group-data-[outside]:group-data-[selected]:text-white",
      "group-data-[outside]:text-foreground/30",

      "group-data-[disabled]:pointer-events-none",
      "group-data-[disabled]:text-foreground/30",
      "group-data-[disabled]:line-through",

      "group-data-[selected]:bg-[#0E3599]",
      "group-data-[selected]:group-[.range-middle]:bg-[#E5EEFF]",
    ),
    day: "group size-9 px-0 text-xs",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
  }

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  )

  const defaultComponents = {
    Chevron: (props: { className?: string; size?: number; disabled?: boolean; orientation?: "left" | "right" | "up" | "down" }): React.JSX.Element => {
      const { orientation, ...rest } = props;
      if (orientation === "left") {
        return <ChevronLeft size={16} strokeWidth={2} {...rest} aria-hidden="true" />;
      }
      if (orientation === "right") {
        return <ChevronRight size={16} strokeWidth={2} {...rest} aria-hidden="true" />;
      }
      return <span />;
    },
  }

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar } 
