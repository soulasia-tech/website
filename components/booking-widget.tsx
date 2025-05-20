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

// Add a hook to detect mobile view
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
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
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Helper for preview summary
  const previewSummary = () => {
    let summary = searchParams.city ? searchParams.city : 'Select city';
    if (date?.from && date?.to) {
      summary += `, ${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d')}`;
    } else {
      summary += ', Select dates';
    }
    summary += `, ${searchParams.adults} adult${searchParams.adults === '1' ? '' : 's'}`;
    if (searchParams.children !== '0') {
      summary += `, ${searchParams.children} child${searchParams.children === '1' ? '' : 'ren'}`;
    }
    return summary;
  };

  if (isMobile && !isExpanded) {
    return (
      <div
        className="bg-white/80 rounded-2xl shadow-lg border border-gray-200 max-w-xl mx-auto px-4 py-4 flex items-center gap-4 cursor-pointer backdrop-blur-md"
        onClick={() => setIsExpanded(true)}
        style={{ minHeight: 72 }}
      >
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">Find your stay</div>
          <div className="text-gray-500 text-sm mt-1">{previewSummary()}</div>
        </div>
        <div className="flex items-center justify-center">
          <Search className="w-7 h-7 text-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-full shadow-lg border border-gray-200 max-w-6xl mx-auto px-2 md:px-0">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row md:items-center md:divide-x md:divide-gray-200 gap-2 md:gap-0 w-full"
      >
        {/* City & Dates Group */}
        <div className="w-full md:flex-[2] md:px-8 md:py-3 flex flex-col md:flex-row gap-2 md:gap-8 justify-center">
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs font-semibold text-gray-700 mb-2 md:text-sm md:font-medium md:mb-1">City</label>
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
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs font-semibold text-gray-700 mb-2 md:text-sm md:font-medium md:mb-1">Dates</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-0 font-normal text-left flex items-center gap-2",
                    !date?.from && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
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
        </div>

        {/* Guests Group */}
        <div className="w-full md:flex-[2] md:px-6 md:py-3 flex flex-col md:flex-row gap-2 md:gap-8 justify-center">
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <div className="font-semibold text-xs text-gray-700 mb-2 md:hidden">Guests</div>
            <label className="block text-xs font-medium text-gray-800 mb-1">Adults</label>
            <Select
              value={searchParams.adults}
              onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, adults: value }))}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto font-normal flex items-center">
                <SelectValue>
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 md:h-4 md:w-4" />
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
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs font-medium text-gray-800 mb-1">Children</label>
            <Select
              value={searchParams.children}
              onValueChange={(value: string) => setSearchParams(prev => ({ ...prev, children: value }))}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto font-normal flex items-center">
                <SelectValue>
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 md:h-4 md:w-4" />
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
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-center h-full px-4 mt-4 md:mt-0 w-full md:w-auto md:flex-none">
          <Button 
            type="submit" 
            size="icon"
            className="h-14 w-full md:h-16 md:w-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-xl flex items-center justify-center text-lg md:text-base font-bold"
            disabled={submitting}
            style={{ boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)' }}
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </Button>
        </div>
      </form>
      {/* Remove close button, add mobile-only bottom spacing */}
      {isMobile && isExpanded && (
        <div className="h-6 md:hidden" />
      )}
    </div>
  )
} 