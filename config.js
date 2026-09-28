export const PROVIDER_MODE = 'hybrid-live'

export const CACHE_POLICIES = {
  locationAutocomplete: { ttlMs: 1000 * 60 * 60, label: '1 hour' },
  countryInfo: { ttlMs: 1000 * 60 * 60 * 24 * 30, label: '30 days' },
  cityInfo: { ttlMs: 1000 * 60 * 60 * 24 * 7, label: '7 days' },
  attractionDiscovery: { ttlMs: 1000 * 60 * 60 * 24, label: '24 hours' },
  restaurantDiscovery: { ttlMs: 1000 * 60 * 60 * 12, label: '12 hours' },
  accommodationDiscovery: { ttlMs: 1000 * 60 * 60 * 6, label: '6 hours' },
  weatherForecast: { ttlMs: 1000 * 60 * 30, label: '30 minutes' },
  tripDraft: { ttlMs: Infinity, label: 'user-owned data' },
}

export const PROVIDERS = {
  locationSearch: { id: 'nominatim', name: 'OpenStreetMap Nominatim', mode: 'real', requiresKey: false },
  countryInfo: { id: 'restCountries', name: 'REST Countries', mode: 'real', requiresKey: false },
  places: { id: 'overpass', name: 'OpenStreetMap Overpass', mode: 'real', requiresKey: false },
  weather: { id: 'openMeteo', name: 'Open-Meteo', mode: 'real', requiresKey: false },
  accommodation: { id: 'osmAccommodation', name: 'OpenStreetMap accommodation tags', mode: 'limited-real', requiresKey: false },
  restaurants: { id: 'osmRestaurants', name: 'OpenStreetMap food tags', mode: 'limited-real', requiresKey: false },
  maps: { id: 'internalMap', name: 'Coordinate map preview', mode: 'scaffold', requiresKey: false },
  routing: { id: 'routingScaffold', name: 'RoutingService interface', mode: 'scaffold', requiresKey: false },
  flights: { id: 'flightFallback', name: 'FlightService fallback links', mode: 'scaffold', requiresKey: false },
  ai: { id: 'localStructuredAssistant', name: 'Structured assistant scaffold', mode: 'mock-until-openai-key', requiresKey: true },
}

export const ENVIRONMENT_VARIABLES = [
  'OPENAI_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'WEATHER_API_KEY',
  'ACCOMMODATION_API_KEY',
  'FLIGHT_API_KEY',
  'DATABASE_URL',
]

export const POI_LIMITS = { attractions: 12, restaurants: 10, accommodation: 10 }
export const FORECAST_RELIABLE_DAYS = 16
