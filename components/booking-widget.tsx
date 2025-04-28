"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Users } from "lucide-react"

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
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
      <form onSubmit={handleSearch} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Property</span>
            </div>
            <select
              value={searchParams.propertyId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, propertyId: e.target.value }))}
              className="w-full h-12 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {properties.map((property) => (
                <option key={property.propertyId} value={property.propertyId}>{property.propertyName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Check-in</span>
            </div>
            <Input
              type="date"
              required
              value={searchParams.startDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
              className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Check-out</span>
            </div>
            <Input
              type="date"
              required
              value={searchParams.endDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
              className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <Users className="w-4 h-4" />
              <span>Guests</span>
            </div>
            <Input
              type="number"
              min="1"
              required
              value={searchParams.guests}
              onChange={(e) => setSearchParams(prev => ({ ...prev, guests: e.target.value }))}
              className="h-12 rounded-xl border-gray-200 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
        >
          Search Availability
        </Button>
      </form>
    </div>
  )
} 