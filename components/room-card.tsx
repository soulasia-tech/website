"use client"

interface RoomCardProps {
  roomName: string;
  propertyName?: string;
  rate?: number;
  amenities?: string[];
}

export function RoomCard({ roomName, propertyName, rate, amenities }: RoomCardProps) {
  return (
    <div className="w-full group">
      {/* Image removed for bookings page */}
      {/* Room and Property Names */}
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-[15px] leading-5">{roomName}</h3>
        {propertyName && (
          <p className="text-[15px] leading-5 text-gray-500">{propertyName}</p>
        )}
        {rate !== undefined && (
          <p className="text-[15px] leading-5 mt-1">
            <span className="font-medium">MYR {rate.toFixed(2)}</span>
            <span className="text-gray-500"> night</span>
          </p>
        )}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {amenities.slice(0, 6).map((amenity: string, idx: number) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {amenity}
              </span>
            ))}
            {amenities.length > 6 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">+{amenities.length - 6} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 