"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Search, CalendarIcon, Loader2 } from "lucide-react"
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
import { calculateTotalGuests } from '@/lib/guest-utils'
import ReactDOM from 'react-dom'

interface BookingWidgetProps {
  initialSearchParams?: {
    city: string;
    startDate: string;
    endDate: string;
    adults: string;
    children: string;
    apartments?: string;
  };
  alwaysSticky?: boolean;
  stickyMode?: 'hero' | 'always';
  hide?: boolean;
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

export function BookingWidget({ initialSearchParams, alwaysSticky, stickyMode, hide }: BookingWidgetProps) {
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
  // Hydration fix: track if component is mounted on client
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // Add refs for step-by-step navigation
  const cityRef = useRef<HTMLButtonElement | null>(null);
  const dateButtonRef = useRef<HTMLButtonElement | null>(null);
  // Track if date picker popover is open
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Sticky logic
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [widgetTop, setWidgetTop] = useState<number | null>(null);
  // For hero sticky mode, track the anchor position
  const [heroAnchorTop, setHeroAnchorTop] = useState<number | null>(null);

  // Add new state for apartments
  const [apartments, setApartments] = useState(() => {
    if (initialSearchParams?.apartments) {
      const n = parseInt(initialSearchParams.apartments, 10);
      return isNaN(n) ? 1 : n;
    }
    return 1;
  });
  const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);

  // Track widget height for placeholder
  const [widgetHeight, setWidgetHeight] = useState<number>(0);
  useEffect(() => {
    if (isSticky && widgetRef.current && window.innerWidth >= 768) {
      setWidgetHeight(widgetRef.current.offsetHeight);
    } else {
      setWidgetHeight(0);
    }
  }, [isSticky]);

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

  useEffect(() => {
    if (stickyMode === 'always' || alwaysSticky) {
      setIsSticky(true);
      return;
    }
    if (stickyMode === 'hero') {
      function handleScroll() {
        if (!widgetRef.current) return;
        const scrollY = window.scrollY || window.pageYOffset;
        // Find the anchor element (where the widget should become sticky)
        const anchor = document.getElementById('booking-widget-hero-anchor');
        if (!anchor) return;
        const anchorRect = anchor.getBoundingClientRect();
        const anchorTop = anchorRect.top + window.scrollY;
        if (heroAnchorTop === null) setHeroAnchorTop(anchorTop);
        // Only sticky on desktop/tablet
        if (window.innerWidth >= 768) {
          // 96px is the top offset for sticky (matches md:top-[96px])
          const stickyOffset = 96;
          if (scrollY + stickyOffset >= anchorTop) {
            setIsSticky(true);
          } else {
            setIsSticky(false);
          }
        } else {
          setIsSticky(false);
        }
      }
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      setTimeout(handleScroll, 100);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
    // fallback: default sticky logic (for other pages)
    function handleScroll() {
      if (!widgetRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const navbarHeight = 72; // px, adjust if needed
      const widgetOffsetTop = widgetTop !== null ? widgetTop : (widgetRef.current.offsetTop - navbarHeight);
      if (widgetTop === null) setWidgetTop(widgetRef.current.offsetTop - navbarHeight);
      if (window.innerWidth >= 768) {
        if (scrollY === 0) {
          setIsSticky(false);
          return;
        }
        if (scrollY >= widgetOffsetTop) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      } else {
        setIsSticky(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [widgetTop, alwaysSticky, stickyMode, heroAnchorTop]);

  if (hide) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchParams.city || !date?.from || !date?.to) {
      return
    }
    setSubmitting(true)
    const totalGuests = calculateTotalGuests(Number(searchParams.adults), Number(searchParams.children));
    const queryString = new URLSearchParams({
      city: searchParams.city,
      startDate: format(date.from, 'yyyy-MM-dd'),
      endDate: format(date.to, 'yyyy-MM-dd'),
      adults: searchParams.adults,
      children: searchParams.children,
      apartments: apartments.toString(),
      guests: totalGuests.toString(),
    }).toString()
    router.push(`/search?${queryString}`)
  }

  // Restore original handleCityChange
  function handleCityChange(value: string) {
    setSearchParams(prev => ({ ...prev, city: value }));
  }

  // Restore original handleDateChange
  function handleDateChange(newDate: DateRange | undefined) {
    setDate(newDate);
  }

  // Restore original handleAdultsChange
  function handleAdultsChange(value: string) {
    setSearchParams(prev => ({ ...prev, adults: value }));
  }

  // Restore original handleChildrenChange
  function handleChildrenChange(value: string) {
    setSearchParams(prev => ({ ...prev, children: value }));
  }

  // Default widget style (used for SSR and non-sticky mode)
  const defaultWidgetStyle = { width: '48rem', margin: '0 auto' };

  // Sticky widget style (used only after hydration, in sticky/portal mode)
  const stickyWidgetStyle: React.CSSProperties = {
    position: 'fixed',
    top: 96,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '48rem',
    zIndex: 9999,
    boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)',
    borderRadius: '9999px',
    background: 'white',
    margin: '0',
  };

  if (!hydrated) {
    // Optionally, return a skeleton or null
    return null;
  }

  if (isMobile && !isExpanded) {
    // Collapsed summary bar, compact: only show 'Find your stay' and icon, left-aligned
    return (
      <div
        className="mx-auto mb-2 mt-0 flex items-center gap-4 cursor-pointer"
        style={{
          width: '100%',
          maxWidth: '95vw',
          minWidth: 0,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
          borderRadius: '1.5rem',
          backdropFilter: 'blur(8px)',
          padding: '20px 24px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => setIsExpanded(true)}
      >
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div className="font-semibold text-xl text-gray-900" style={{lineHeight: 1.2}}>Find your stay</div>
        </div>
        <div className="flex items-center justify-center ml-4">
          <Search className="w-7 h-7 text-gray-700" />
        </div>
      </div>
    );
  }

  if (isMobile && isExpanded) {
    // Expanded form, inline (not modal), with top padding for navbar
    return (
      <div className="fixed inset-0 z-50 bg-white/100 overflow-y-auto flex flex-col px-4 py-6" style={{maxWidth: '100vw', background: '#fff', paddingTop: '80px'}}>
        <div className="flex justify-end mb-4">
          <button
            aria-label="Close booking form"
            className="text-3xl text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => setIsExpanded(false)}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            &times;
          </button>
        </div>
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-4 w-full"
        >
          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-left">City</label>
            <Select
              value={searchParams.city}
              onValueChange={handleCityChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full border rounded-lg p-3 text-base">
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
          {/* Dates */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-left">Dates</label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start p-3 text-base font-normal text-left flex items-center gap-2 border rounded-lg",
                    !date?.from && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {date?.from && date?.to
                    ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d")}`
                    : <span>Pick dates</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={1}
                  initialFocus
                  className="rounded-lg border border-border p-2"
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Guests & Apartments */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 text-left">Guests & Apartments</label>
            <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start p-3 text-base font-normal text-left flex items-center gap-2 border rounded-lg"
                >
                  {`${searchParams.adults} adult${searchParams.adults === '1' ? '' : 's'}, ${searchParams.children} kid${searchParams.children === '1' ? '' : 's'}, ${apartments} apartment${apartments === 1 ? '' : 's'}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Adults</div>
                      <div className="text-xs text-gray-500">Ages 18 or above</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.adults) <= 1} onClick={() => handleAdultsChange((parseInt(searchParams.adults) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.adults}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleAdultsChange((parseInt(searchParams.adults) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Kids</div>
                      <div className="text-xs text-gray-500">Ages 3-17</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.children) <= 0} onClick={() => handleChildrenChange((parseInt(searchParams.children) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.children}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleChildrenChange((parseInt(searchParams.children) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Apartments</div>
                      <div className="text-xs text-gray-500">Number of apartments</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={apartments <= 1} onClick={() => setApartments(apartments - 1)}>-</Button>
                      <span className="w-6 text-center">{apartments}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => setApartments(apartments + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {/* Search Button */}
          <div className="flex items-center justify-center mt-4">
            <Button
              type="submit"
              className="h-14 w-full rounded-full bg-[#0E3599] hover:bg-[#0b297a] text-white shadow-xl flex items-center justify-center text-lg font-bold"
              disabled={submitting}
              style={{ boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)' }}
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2"><Search className="w-6 h-6" /> Search</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Portal logic for sticky mode
  const widgetContent = (
    <div
      ref={widgetRef}
      className={
        `bg-white rounded-xl md:rounded-full shadow-lg border border-gray-200 mx-auto px-2 md:px-0 z-30 transition-[top,box-shadow] duration-300`
      }
      style={defaultWidgetStyle}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row md:items-center md:divide-x md:divide-gray-200 gap-2 md:gap-0 w-full"
      >
        {/* City & Dates Group */}
        <div className="w-full md:flex-[2] md:px-8 md:py-3 flex flex-col md:flex-row gap-2 md:gap-8 justify-center">
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-semibold md:font-medium text-gray-700 mb-2 md:mb-1 text-left">City</label>
            <Select
              value={searchParams.city}
              onValueChange={handleCityChange}
              disabled={loading}
            >
              <SelectTrigger
                ref={cityRef}
                className="w-full border-0 p-0 h-auto font-normal"
              >
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
          <div className="w-full md:w-[220px] md:max-w-[260px] bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-semibold md:font-medium text-gray-700 mb-2 md:mb-1 text-left">Dates</label>
            <Popover
              open={datePopoverOpen}
              onOpenChange={setDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  ref={dateButtonRef}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-0 font-normal text-left flex items-center gap-2 truncate",
                    !date?.from && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                  {date?.from && date?.to
                    ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d")}`
                    : <span>Pick dates</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleDateChange}
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
          <div className="flex-1 md:basis-48 md:max-w-[200px] bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-1 text-left">Add guests</label>
            <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 font-normal text-left flex items-center gap-2"
                >
                  {`${searchParams.adults} adult${searchParams.adults === '1' ? '' : 's'}, ${searchParams.children} kid${searchParams.children === '1' ? '' : 's'}, ${apartments} apartment${apartments === 1 ? '' : 's'}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Adults</div>
                      <div className="text-xs text-gray-500">Ages 18 or above</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.adults) <= 1} onClick={() => handleAdultsChange((parseInt(searchParams.adults) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.adults}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleAdultsChange((parseInt(searchParams.adults) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Kids</div>
                      <div className="text-xs text-gray-500">Ages 3-17</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.children) <= 0} onClick={() => handleChildrenChange((parseInt(searchParams.children) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.children}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleChildrenChange((parseInt(searchParams.children) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Apartments</div>
                      <div className="text-xs text-gray-500">Number of apartments</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={apartments <= 1} onClick={() => setApartments(apartments - 1)}>-</Button>
                      <span className="w-6 text-center">{apartments}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => setApartments(apartments + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-center flex-none px-0 md:px-0 mx-1 md:mx-2">
          <Button 
            type="submit" 
            size="icon"
            className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-[#0E3599] hover:bg-[#0b297a] text-white shadow-xl flex items-center justify-center text-lg md:text-base font-bold"
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
  );

  // Sticky/portal version (only after hydration)
  const stickyWidgetContent = (
    <div
      ref={widgetRef}
      className={
        `bg-white rounded-xl md:rounded-full shadow-lg border border-gray-200 mx-auto px-2 md:px-0 z-30 transition-[top,box-shadow] duration-300`
      }
      style={stickyWidgetStyle}
    >
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row md:items-center md:divide-x md:divide-gray-200 gap-2 md:gap-0 w-full"
      >
        {/* City & Dates Group */}
        <div className="w-full md:flex-[2] md:px-8 md:py-3 flex flex-col md:flex-row gap-2 md:gap-8 justify-center">
          <div className="flex-1 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-semibold md:font-medium text-gray-700 mb-2 md:mb-1 text-left">City</label>
            <Select
              value={searchParams.city}
              onValueChange={handleCityChange}
              disabled={loading}
            >
              <SelectTrigger
                ref={cityRef}
                className="w-full border-0 p-0 h-auto font-normal"
              >
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
          <div className="w-full md:w-[220px] md:max-w-[260px] bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-semibold md:font-medium text-gray-700 mb-2 md:mb-1 text-left">Dates</label>
            <Popover
              open={datePopoverOpen}
              onOpenChange={setDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  ref={dateButtonRef}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-0 font-normal text-left flex items-center gap-2 truncate",
                    !date?.from && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                  {date?.from && date?.to
                    ? `${format(date.from, "MMM d")} - ${format(date.to, "MMM d")}`
                    : <span>Pick dates</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={date}
                  onSelect={handleDateChange}
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
          <div className="flex-1 md:basis-48 md:max-w-[200px] bg-gray-50 md:bg-transparent rounded-lg md:rounded-none shadow-sm md:shadow-none p-4 md:p-0 mb-2 md:mb-0">
            <label className="block text-xs md:text-sm font-medium text-gray-800 mb-1 text-left">Add guests</label>
            <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 font-normal text-left flex items-center gap-2"
                >
                  {`${searchParams.adults} adult${searchParams.adults === '1' ? '' : 's'}, ${searchParams.children} kid${searchParams.children === '1' ? '' : 's'}, ${apartments} apartment${apartments === 1 ? '' : 's'}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Adults</div>
                      <div className="text-xs text-gray-500">Ages 18 or above</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.adults) <= 1} onClick={() => handleAdultsChange((parseInt(searchParams.adults) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.adults}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleAdultsChange((parseInt(searchParams.adults) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Kids</div>
                      <div className="text-xs text-gray-500">Ages 3-17</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={parseInt(searchParams.children) <= 0} onClick={() => handleChildrenChange((parseInt(searchParams.children) - 1).toString())}>-</Button>
                      <span className="w-6 text-center">{searchParams.children}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => handleChildrenChange((parseInt(searchParams.children) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Apartments</div>
                      <div className="text-xs text-gray-500">Number of apartments</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="icon" variant="outline" disabled={apartments <= 1} onClick={() => setApartments(apartments - 1)}>-</Button>
                      <span className="w-6 text-center">{apartments}</span>
                      <Button type="button" size="icon" variant="outline" onClick={() => setApartments(apartments + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-center flex-none px-0 md:px-0 mx-1 md:mx-2">
          <Button 
            type="submit" 
            size="icon"
            className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-[#0E3599] hover:bg-[#0b297a] text-white shadow-xl flex items-center justify-center text-lg md:text-base font-bold"
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
  );

  return (
    <>
      {/* Spacer to prevent layout shift when sticky (desktop/tablet only) */}
      {isSticky && widgetHeight > 0 && hydrated && (
        <div className="hidden md:block" style={{ height: widgetHeight }} />
      )}
      {/* On server or before hydration, always render default (non-sticky, non-portal) version */}
      {!hydrated
        ? widgetContent
        : (alwaysSticky || isSticky || stickyMode === 'always') && typeof window !== 'undefined' && window.innerWidth >= 768
          ? ReactDOM.createPortal(stickyWidgetContent, document.body)
          : widgetContent}
    </>
  )
} 