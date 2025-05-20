"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, Users, CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRange } from "react-day-picker"

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
    adults: initialSearchParams?.adults || '2',
    children: initialSearchParams?.children || '0',
  })
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (initialSearchParams?.startDate && initialSearchParams?.endDate) {
      return {
        from: new Date(initialSearchParams.startDate),
        to: new Date(initialSearchParams.endDate),
      }
    }
    return undefined
  })
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cloudbeds-properties')
        const data = await res.json()
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          const uniqueCities: string[] = Array.from(new Set(data.properties.map((p: { city: string }) => String(p.city))))
          setCities(uniqueCities)
          if (!initialSearchParams?.city) {
            setSearchParams(prev => ({ ...prev, city: uniqueCities[0] || '' }))
          }
        } else {
          setCities([])
        }
      } catch {
        setCities([])
      }
      setLoading(false)
    }
    fetchProperties()
  }, [initialSearchParams?.city])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchParams.city || !date?.from || !date?.to) {
      return
    }
    setSubmitting(true)
    const queryString = new URLSearchParams({
      city: searchParams.city,
      startDate: format(date.from, 'yyyy-MM-dd'),
      endDate: format(date.to, 'yyyy-MM-dd'),
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
          <label className="block text-sm font-medium text-gray-800 mb-1">City</label>
          <Select
            value={searchParams.city}
            onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, city: value }))}
            disabled={loading}
          >
            <SelectTrigger className="w-full border-0 p-0 h-auto font-normal">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="relative flex-[2] min-w-[260px] px-6 py-3">
          <label className="block text-sm font-medium text-gray-800 mb-1">Dates</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-0 font-normal text-left",
                  !date?.from && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from && date?.to
                  ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
                  : <span>Pick dates</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                initialFocus
                className="rounded-lg border border-border p-2"
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Adults */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800 mb-1">Adults</label>
          <Select
            value={searchParams.adults}
            onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, adults: value }))}
          >
            <SelectTrigger className="w-full border-0 p-0 h-auto font-normal">
              <SelectValue>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {searchParams.adults} {parseInt(searchParams.adults) === 1 ? 'adult' : 'adults'}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'adult' : 'adults'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Children */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800 mb-1">Children</label>
          <Select
            value={searchParams.children}
            onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, children: value }))}
          >
            <SelectTrigger className="w-full border-0 p-0 h-auto font-normal">
              <SelectValue>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {searchParams.children} {parseInt(searchParams.children) === 1 ? 'child' : 'children'}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'child' : 'children'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="pr-2 pl-4 py-2">
          <Button 
            type="submit" 
            size="icon"
            className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 