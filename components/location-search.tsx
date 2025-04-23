"use client"

import { useState } from "react"
import { Check, MapPin, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const locations = [
  { value: "klcc", label: "KLCC" },
  { value: "bukit-bintang", label: "Bukit Bintang" },
  { value: "mont-kiara", label: "Mont Kiara" },
  { value: "bangsar", label: "Bangsar" },
  { value: "damansara-heights", label: "Damansara Heights" },
  { value: "cheras", label: "Cheras" },
  { value: "ampang", label: "Ampang" },
  { value: "petaling-jaya", label: "Petaling Jaya" },
  { value: "subang-jaya", label: "Subang Jaya" },
  { value: "sentul", label: "Sentul" },
]

interface LocationSearchProps {
  value: string
  onChange: (value: string) => void
}

export function LocationSearch({ value, onChange }: LocationSearchProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full">
      <p className="text-xs font-medium text-gray-500 mb-1">Where</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal h-auto p-0"
          >
            {value
              ? locations.find((location) => location.value === value)?.label || "Search destinations"
              : "Search destinations"}
            <Search className="ml-auto h-5 w-5 text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search for a location..." />
            <CommandList>
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                {locations.map((location) => (
                  <CommandItem
                    key={location.value}
                    value={location.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {location.label}
                    <Check className={cn("ml-auto h-4 w-4", value === location.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
} 