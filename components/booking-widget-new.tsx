"use client"

import React, {useState, useEffect, useRef} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react"
import {format} from "date-fns"
import {cn} from "@/lib/utils"
import {Calendar} from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent, SelectGroup,
  SelectItem, SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {DateRange} from "react-day-picker"
import {calculateTotalGuests} from '@/lib/guest-utils'
import Image from "next/image";

interface BookingWidgetProps {
  initialSearchParams?: {
    city: string;
    startDate: string;
    endDate: string;
    adults: string;
    children: string;
    apartments?: string;
  };
  guestsPopoverOpen?: boolean
  setGuestsPopoverOpen?: React.Dispatch<React.SetStateAction<boolean>>

  citySelectOpen?: boolean
  setCitySelectOpen?: React.Dispatch<React.SetStateAction<boolean>>

  datePopoverOpen?: boolean
  setDatePopoverOpen?: React.Dispatch<React.SetStateAction<boolean>>

  hide?: boolean;
}

export function BookingWidgetNew({
                                   initialSearchParams,
                                   guestsPopoverOpen,
                                   setGuestsPopoverOpen,
                                   citySelectOpen,
                                   setCitySelectOpen,
                                   datePopoverOpen,
                                   setDatePopoverOpen,
                                   hide
                                 }: BookingWidgetProps) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    touchRooms: false,
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
  // Hydration fix: track if component is mounted on client

  // Add refs for step-by-step navigation
  const cityRef = useRef<HTMLButtonElement | null>(null);
  const dateButtonRef = useRef<HTMLButtonElement | null>(null);
  // Track if date picker popover is open
  // const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [touchRooms, setTouchRooms] = useState(false);

  // Add new state for apartments
  const [apartments, setApartments] = useState(() => {
    if (initialSearchParams?.apartments) {
      const n = parseInt(initialSearchParams.apartments, 10);
      return isNaN(n) ? 1 : n;
    }
    return 1;
  });
  // const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cloudbeds-properties')
        const data = await res.json()
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          const uniqueCities: string[] = Array.from(new Set(data.properties.map((p: {
            city: string
          }) => String(p.city))))
          setCities(uniqueCities)
          if (!initialSearchParams?.city) {
            setSearchParams(prev => ({...prev, city: uniqueCities[0] || ''}))
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

  if (hide) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (
        !searchParams.city ||
        !date?.from ||
        !date?.to ||
        date.from.getTime() === date.to.getTime() // Prevent same-day check-in and checkout
    ) {
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
      // apartments: apartments.toString(),
      guests: totalGuests.toString(),
    }).toString()
    router.push(`/search?${queryString}`)
    setSubmitting(false)
  }

  // Restore original handleCityChange
  function handleCityChange(value: string) {
    setSearchParams(prev => ({...prev, city: value}));
  }

  // Restore original handleDateChange
  function handleDateChange(newDate: DateRange | undefined) {
    setDate(newDate);
  }

  // Restore original handleAdultsChange
  function handleAdultsChange(value: string) {
    setSearchParams(prev => ({...prev, adults: value}));
  }

  // Restore original handleChildrenChange
  function handleChildrenChange(value: string) {
    setSearchParams(prev => ({...prev, children: value}));
  }

  // Portal logic for sticky mode
  const widgetContent = (
      <form
          onSubmit={handleSearch}
          className="flex flex-col tb:flex-row items-center gap-2 "
      >
        {/* City & Dates Group */}
        <div className="w-full flex justify-center grid grid-cols-1 tb:grid-cols-3 lp:grid-cols-[1fr_280px_280px] gap-2 ">
          <div className={["flex items-center bg-white border border-[#DEE3ED] rounded-lg p-0 mb-2 tb:mb-0",
            "w-full lp:w-[280px]",
            "h-[var(--action-h-lg)] tb:h-[var(--action-h-1xl)]"].join(' ')}
          >
            <Select
                value={searchParams.city}
                onValueChange={handleCityChange}
                disabled={loading}
                open={citySelectOpen}
                onOpenChange={setCitySelectOpen}
            >
              <SelectTrigger
                  ref={cityRef}
                  hideIcon={true}
                  className="cursor-pointer w-full h-full border-0 px-4 font-normal outline-none focus-visible:ring-0
                      data-[placeholder]:text-[#4a4f5b] data-[placeholder]:text-xs data-[placeholder]:lp:text-sm
                  "
              >
                <SelectValue placeholder="Enter the direction"></SelectValue>
              </SelectTrigger>
              <SelectContent className="mt-3 w-full">
                <SelectGroup>
                  <SelectLabel className="font-semibold p-2 text-xs tb:text-sm text-[#101828]">
                    Popular destinations
                  </SelectLabel>
                  {cities.map((city) => (
                      <SelectItem
                          key={city}
                          value={city}
                          className="flex items-center gap-2"
                      >
                        <div className="flex items-center w-[16px] h-[16px] lp:w-[20px] lp:h-[20px]">
                          <Image
                              src="/icons/location.svg" alt="" className="w-full h-full text-[#0E3599]"
                              width={24}
                              height={24}
                          />
                        </div>
                        <div className="text-[#0e3599] font-medium text-xs">{city}</div>
                      </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className={["flex items-center bg-white rounded-lg  mb-2 tb:mb-0",
            "w-full lp:w-[280px]",
            "h-[var(--action-h-lg)] tb:h-[var(--action-h-1xl)]"].join(' ')}
          >
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                    ref={dateButtonRef}
                    size="responsive"
                    variant="none"
                    className={cn(
                        "cursor-pointer border border-[#DEE3ED] w-full h-full justify-start px-4 font-normal text-left flex items-center truncate" +
                        "font-normal text-[#4a4f5b] text-xs lp:text-sm",
                        !date?.from && "text-gray-400"
                    )}
                >
                  {date?.from && date?.to && date.from.getTime() !== date.to.getTime() ? (
                      `${format(date.from, "MMM d")} - ${format(date.to, "MMM d")}`
                  ) : date?.from ? (
                      `${format(date.from, "MMM d")} - Select checkout`
                  ) : (
                      <span className="text-[#4a4f5b]">Arrival date - Departure date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                  className="mt-1 w-[var(--radix-popover-trigger-width)] max-w-[280px] rounded-lg p-5 flex items-center justify-center"
                  align="center">
                <Calendar
                    mode="range"
                    selected={date}
                    onSelect={handleDateChange}
                    numberOfMonths={1}
                    initialFocus
                    disabled={{before: new Date()}}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className={["flex items-center bg-white  rounded-lg  mb-2 tb:mb-0",
            "w-full lp:w-[280px]",
            "h-[var(--action-h-lg)] tb:h-[var(--action-h-1xl)]"].join(' ')}
          >
            <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                    variant="none"
                    size="responsive"
                    className="cursor-pointer border border-[#DEE3ED] px-4 w-full h-full justify-start font-normal text-left flex items-center gap-2
                        font-normal text-[#4a4f5b] text-xs lp:text-sm"
                    onClick={() => setTouchRooms(true)}
                >
                  {touchRooms ?
                      `${searchParams.adults} adult${searchParams.adults === '1' ? '' : 's'}, ${searchParams.children} kid${searchParams.children === '1' ? '' : 's'}, ${apartments} apartment${apartments === 1 ? '' : 's'}`
                      : 'Guests and rooms'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-4" align="start">
                <div className="space-y-3 lp:space-y-6">
                  <div className="flex w-max-content items-center justify-between gap-15">
                    <div>
                      <div className="font-semibold text-xs lp:text-base text-[#101828]">Adults</div>
                      <div className="font-normal text-[10px] lp:text-xs text-[#4a4f5b]">Ages 18 or above</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="responsive" variant="outline"
                              disabled={parseInt(searchParams.adults) <= 1}
                              className="size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              onClick={() => handleAdultsChange((parseInt(searchParams.adults) - 1).toString())}>-</Button>
                      <span
                          className="font-semibold text-xs lp:text-base text-[#101828] text-center">{searchParams.adults}</span>
                      <Button type="button" size="responsive" variant="outline"
                              className="bg-[#e5eeff]  size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              onClick={() => handleAdultsChange((parseInt(searchParams.adults) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs lp:text-base text-[#101828]">Kids</div>
                      <div className="font-normal text-[10px] lp:text-xs text-[#4a4f5b]">Ages 3-17</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="responsive" variant="outline"
                              className="size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              disabled={parseInt(searchParams.children) <= 0}
                              onClick={() => handleChildrenChange((parseInt(searchParams.children) - 1).toString())}>-</Button>
                      <span
                          className="font-semibold text-xs lp:text-base text-[#101828] text-center">{searchParams.children}</span>
                      <Button type="button" size="responsive" variant="outline"
                              className="bg-[#e5eeff] size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              onClick={() => handleChildrenChange((parseInt(searchParams.children) + 1).toString())}>+</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs lp:text-base text-[#101828]">Apartments</div>
                      <div className="font-normal text-[10px] lp:text-xs text-[#4a4f5b]">Number of apartments</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" size="responsive" variant="outline"
                              className="size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              disabled={(apartments) <= 0}
                              onClick={() => setApartments(apartments - 1)}>-</Button>
                      <span
                          className="font-semibold text-xs lp:text-base text-[#101828] text-center">{apartments}</span>
                      <Button type="button" size="responsive" variant="outline"
                              className="bg-[#e5eeff] size-[var(--action-h-sm)] lp:size-[var(--action-h-md)]"
                              onClick={() => setApartments(apartments + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Search Button */}
        <Button
            type="submit"
            size="default"
            className={['cursor-pointer flex items-center justify-center bg-[#0E3599] hover:bg-[#0b297a]',
              'text-white text-xs lp:text-base font-normal font-semibold',
              'h-[var(--action-h-lg)] tb:h-[var(--action-h-1xl)] w-full tb:w-fit tb:px-4 lp:px-6 full:px-9 ',
            ].join(' ')}
            disabled={submitting}
        >
          {submitting ? (<Loader2 className="w-6 h-6 animate-spin"/>) : 'Search'}
        </Button>
      </form>
  );

  return (
      <>
        {widgetContent}
      </>
  )
}
