"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function BookingWidget() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    propertyId: '',
    startDate: '',
    endDate: '',
    guests: '1'
  })
  const [properties, setProperties] = useState<{ propertyId: string, propertyName: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/cloudbeds-properties')
        const data = await res.json()
        if (data.success && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties)
          setSearchParams(prev => ({ ...prev, propertyId: data.properties[0].propertyId }))
        } else {
          setProperties([{ propertyId: '', propertyName: 'No properties found' }])
        }
      } catch {
        setProperties([{ propertyId: '', propertyName: 'Failed to load properties' }])
      }
      setLoading(false)
    }
    fetchProperties()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchParams.propertyId || !searchParams.startDate || !searchParams.endDate) {
      return
    }
    const queryString = new URLSearchParams(searchParams).toString()
    router.push(`/search?${queryString}`)
  }

  return (
    <div className="bg-white rounded-full shadow-lg border border-gray-200 max-w-6xl mx-auto">
      <form onSubmit={handleSearch} className="flex items-center divide-x divide-gray-200">
        {/* Where */}
        <div className="relative flex-[2] min-w-[240px] pl-8 pr-4 py-3">
          <label className="block text-sm font-medium text-gray-800">Where</label>
          <select
            value={searchParams.propertyId}
            onChange={(e) => setSearchParams(prev => ({ ...prev, propertyId: e.target.value }))}
            className="w-full bg-transparent border-0 outline-none text-gray-600 text-sm placeholder:text-gray-400"
            disabled={loading}
          >
            {properties.map((property) => (
              <option key={property.propertyId} value={property.propertyId}>{property.propertyName}</option>
            ))}
          </select>
        </div>

        {/* Check in */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Check in</label>
          <Input
            type="date"
            required
            value={searchParams.startDate}
            onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
            className="border-0 p-0 text-gray-600 text-sm focus:ring-0"
          />
        </div>

        {/* Check out */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Check out</label>
          <Input
            type="date"
            required
            value={searchParams.endDate}
            onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
            className="border-0 p-0 text-gray-600 text-sm focus:ring-0"
          />
        </div>

        {/* Who */}
        <div className="relative flex-1 px-6 py-3">
          <label className="block text-sm font-medium text-gray-800">Who</label>
          <Input
            type="number"
            min="1"
            required
            value={searchParams.guests}
            onChange={(e) => setSearchParams(prev => ({ ...prev, guests: e.target.value }))}
            className="border-0 p-0 text-gray-600 text-sm focus:ring-0"
            placeholder="Add guests"
          />
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