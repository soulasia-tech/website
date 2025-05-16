"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, CalendarIcon, Users } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { DayPicker } from "react-day-picker"

interface BookingWidgetProps {
  initialSearchParams?: {
    city: string;
    startDate: string;
    endDate: string;
    adults: string;
    children: string;
  }
}

export function BookingWidget({ initialSearchParams }: BookingWidgetProps) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    city: initialSearchParams?.city || '',
    startDate: initialSearchParams?.startDate || '',
    endDate: initialSearchParams?.endDate || '',
    adults: initialSearchParams?.adults || '2',
    children: initialSearchParams?.children || '0',
  })
  const [properties, setProperties] = useState<{ propertyId: string, propertyName: string, city: string }[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Add disabled dates logic
  const disabledDays = {
    before: new Date(),
  }

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cloudbeds-properties')
        const data = await res.json()
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties)
          // Get unique cities as string[]
          const uniqueCities = Array.from(new Set(data.properties.map((p: { city: string }) => p.city))) as string[]
          setCities(uniqueCities)
          if (!initialSearchParams?.city) {
            setSearchParams(prev => ({ ...prev, city: String(uniqueCities[0]) }))
          }
        } else {
          setProperties([])
          setCities([])
        }
      } catch {
        setProperties([])
        setCities([])
      }
      setLoading(false)
    }
    fetchProperties()
  }, [initialSearchParams?.city])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchParams.city || !searchParams.startDate || !searchParams.endDate) {
      return
    }
    const queryString = new URLSearchParams({
      city: searchParams.city,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      adults: searchParams.adults,
      children: searchParams.children,
    }).toString()
    router.push(`/search?${queryString}`)
  }

  return (
    <div className="bg-white rounded-full shadow-lg border border-gray-200 max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="flex items-center divide-x divide-gray-200">
        {/* City */}
        <div className="relative flex-[2] min-w-[240px] pl-8 pr-4 py-3">
          <label className="block text-sm font-medium text-gray-800">City</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={loading}>
              <Button variant="ghost" className="w-full justify-start p-0 font-normal">
                {searchParams.city || 'Select a city'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]">
              {cities.map((city) => (
                <DropdownMenuItem
                  key={city}
                  onClick={() => setSearchParams(prev => ({ ...prev, city }))}
                >
                  {city}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Check in */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Check in</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-0 font-normal",
                  !searchParams.startDate && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startDate ? format(new Date(searchParams.startDate), "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DayPicker
                mode="single"
                selected={searchParams.startDate ? new Date(searchParams.startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = format(date, 'yyyy-MM-dd')
                    setSearchParams(prev => ({ 
                      ...prev, 
                      startDate: formattedDate,
                      endDate: prev.endDate && new Date(prev.endDate) <= date ? 
                        format(addDays(date, 1), 'yyyy-MM-dd') : 
                        prev.endDate
                    }))
                  }
                }}
                disabled={disabledDays}
                fromMonth={new Date()}
                defaultMonth={new Date()}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                  ),
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
                showOutsideDays={false}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check out */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Check out</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-0 font-normal",
                  !searchParams.endDate && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.endDate ? format(new Date(searchParams.endDate), "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DayPicker
                mode="single"
                selected={searchParams.endDate ? new Date(searchParams.endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const formattedDate = format(date, 'yyyy-MM-dd')
                    setSearchParams(prev => ({ ...prev, endDate: formattedDate }))
                  }
                }}
                disabled={{
                  ...disabledDays,
                  before: searchParams.startDate ? addDays(new Date(searchParams.startDate), 1) : new Date()
                }}
                fromMonth={searchParams.startDate ? new Date(searchParams.startDate) : new Date()}
                defaultMonth={searchParams.startDate ? new Date(searchParams.startDate) : new Date()}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                  ),
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
                showOutsideDays={false}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Who */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Adults</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 font-normal">
                <Users className="mr-2 h-4 w-4" />
                {searchParams.adults} {parseInt(searchParams.adults) === 1 ? 'adult' : 'adults'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <DropdownMenuItem
                  key={num}
                  onClick={() => setSearchParams(prev => ({ ...prev, adults: num.toString() }))}
                >
                  {num} {num === 1 ? 'adult' : 'adults'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Children</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 font-normal">
                <Users className="mr-2 h-4 w-4" />
                {searchParams.children} {parseInt(searchParams.children) === 1 ? 'child' : 'children'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <DropdownMenuItem
                  key={num}
                  onClick={() => setSearchParams(prev => ({ ...prev, children: num.toString() }))}
                >
                  {num} {num === 1 ? 'child' : 'children'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Button */}
        <div className="pr-2 pl-4 py-2">
          <Button 
            type="submit" 
            size="icon"
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  )
} 