"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { DatePicker } from "./date-picker"
import { LocationSearch } from "./location-search"
import { addDays } from "date-fns"
import { motion } from "framer-motion"

export function BookingWidget() {
  const [location, setLocation] = useState("")
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined)
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearch = () => {
    // Show loading state
    setIsSubmitting(true)

    // Log search data
    console.log("Search submitted:", {
      location,
      checkInDate,
      checkOutDate,
    })

    // Short timeout to show loading state before redirecting
    setTimeout(() => {
      // Redirect to Calendly in the same tab
      window.location.href = "https://calendly.com/glebgordeev/30min"
    }, 1000)
  }

  // Set checkout date to be one day after check-in when check-in is selected
  const handleCheckInChange = (date: Date | undefined) => {
    setCheckInDate(date)
    if (date && (!checkOutDate || checkOutDate <= date)) {
      setCheckOutDate(addDays(date, 1))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="w-full max-w-4xl"
    >
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="p-4 md:col-span-4 border-b md:border-b-0 md:border-r border-gray-100">
            <LocationSearch value={location} onChange={setLocation} />
          </div>

          <div className="p-4 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-100">
            <DatePicker date={checkInDate} setDate={handleCheckInChange} label="Check in" placeholder="Add dates" />
          </div>

          <div className="p-4 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-100">
            <DatePicker date={checkOutDate} setDate={setCheckOutDate} label="Check out" placeholder="Add dates" />
          </div>

          <div className="p-4 md:col-span-2 flex items-center">
            <Button
              onClick={handleSearch}
              disabled={isSubmitting}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              Search
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 