"use client"

import { useState } from "react"
import { Check, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Mock locations data
const locations = [
  {
    value: "kuala-lumpur",
    label: "Kuala Lumpur",
  },
  {
    value: "penang",
    label: "Penang",
  },
  {
    value: "langkawi",
    label: "Langkawi",
  },
  {
    value: "malacca",
    label: "Malacca",
  },
]

interface LocationSearchProps {
  value: string
  onChange: (value: string) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 border-0"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            {value ? locations.find((location) => location.value === value)?.label : "Where to?"}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location.value}
                value={location.value}
                onSelect={(currentValue) => {
                  onChange(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === location.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {location.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 