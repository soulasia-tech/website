// Simple in-memory cache for all locations data

// Define types for the cached data
export interface CachedProperties {
  success: boolean;
  properties: Array<{ propertyId: string; propertyName?: string; price_per_day?: number }>;
}
export interface CachedRooms {
  success: boolean;
  roomTypes: Array<{ roomTypeID: string; roomTypeName: string; roomTypePhotos: string[] }>;
}
export interface CachedRates {
  success: boolean;
  ratePlans: Array<{ roomTypeID: string; totalRate: number }>;
}

export const allLocationsCache = {
  properties: null as CachedProperties | null,
  rooms: null as CachedRooms[] | null,
  rates: null as CachedRates[] | null,
  setProperties(data: CachedProperties) { this.properties = data },
  setRooms(data: CachedRooms[]) { this.rooms = data },
  setRates(data: CachedRates[]) { this.rates = data },
  clear() { this.properties = null; this.rooms = null; this.rates = null; },
}; 