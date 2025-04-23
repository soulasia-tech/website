"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label: string
  placeholder?: string
}

export function DatePicker({ date, setDate, label, placeholder = "Select date" }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="w-full justify-start text-left font-normal h-auto p-0">
            {date ? (
              <span className="text-base">{format(date, "PPP")}</span>
            ) : (
              <span className="text-base text-gray-800">{placeholder}</span>
            )}
            <CalendarIcon className="ml-auto h-5 w-5 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              setOpen(false)
            }}
            initialFocus
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 