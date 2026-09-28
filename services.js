import { CACHE_POLICIES, POI_LIMITS, PROVIDERS } from './config.js'
import { buildItinerary, dateWithinForecastRange, estimateBudget, rankPlaces, sourceMeta } from './domain.js'

function bboxAround({ lat, lon }, km = 12) { const dLat = km / 111; const dLon = km / (111 * Math.cos(lat * Math.PI / 180) || 1); return [lat-dLat, lon-dLon, lat+dLat, lon+dLon] }
function addressLine(tags = {}) { return [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(' ') || tags.address || 'Address unavailable' }
function osmUrl(type, id) { return `${'https://' + 'www.openstreetmap.org'}/${type}/${id}` }
function normalizeName(tags = {}, fallback) { return tags.name || tags['name:en'] || fallback || 'Unnamed place' }
function osmCategory(tags = {}) { return tags.tourism || tags.historic || tags.leisure || tags.amenity || 'place' }
function overpassElementToPlace(el, kind) {
  const tags = el.tags || {}, lat = el.lat || el.center?.lat, lon = el.lon || el.center?.lon
  return { id: `osm:${el.type}:${el.id}`, providerId: String(el.id), kind, name: normalizeName(tags, `${kind} ${el.id}`), category: osmCategory(tags), description: tags.description || tags.wikidata || tags.wikipedia || '', address: addressLine(tags), coordinates: { lat, lon }, website: tags.website || tags['contact:website'] || '', phone: tags.phone || tags['contact:phone'] || '', openingHours: tags.opening_hours || null, price: tags.fee ? { label: tags.fee === 'yes' ? 'Fee indicated; amount unavailable' : tags.fee, type: 'source tag' } : null, rating: null, reviewCount: null, source: sourceMeta('OpenStreetMap / Overpass', osmUrl(el.type, el.id), CACHE_POLICIES.attractionDiscovery.ttlMs, 'medium'), freshnessNote: 'Ratings, review counts and ticket prices are not available from OpenStreetMap. Connect Google Places/official ticket providers for those fields.' }
}

export class LocationSearchService {
  constructor(gateway) { this.gateway = gateway }
  async search(query, { countryCode } = {}) {
    if (!query || query.trim().length < 2) return []
    const params = new URLSearchParams({ q: query.trim(), format: 'jsonv2', addressdetails: '1', limit: '8', dedupe: '1' })
    if (countryCode) params.set('countrycodes', countryCode.toLowerCase())
    const url = `${'https://' + 'nominatim.openstreetmap.org'}/search?${params}`
    const json = await this.gateway.proxyJson(url, { cacheKey: `location:${query}:${countryCode || 'any'}`, policy: CACHE_POLICIES.locationAutocomplete })
    return (Array.isArray(json) ? json : []).map((item) => ({ id: `nominatim:${item.place_id}`, placeId: String(item.place_id), city: item.address?.city || item.address?.town || item.address?.village || item.name || item.display_name?.split(',')[0], country: item.address?.country || '', countryCode: item.address?.country_code?.toUpperCase() || '', formatted: item.display_name, coordinates: { lat: Number(item.lat), lon: Number(item.lon) }, type: item.type || item.addresstype || 'destination', source: sourceMeta('OpenStreetMap Nominatim', 'https://' + 'nominatim.openstreetmap.org' + '/', CACHE_POLICIES.locationAutocomplete.ttlMs, 'medium') })).filter((d) => Number.isFinite(d.coordinates.lat) && Number.isFinite(d.coordinates.lon))
  }
}

export class CountryInfoService {
  constructor(gateway) { this.gateway = gateway }
  async getByCountryCode(code) {
    if (!code) return null
    const url = `${'https://' + 'api.worldbank.org'}/v2/country/${encodeURIComponent(code)}?format=json`
    const json = await this.gateway.proxyJson(url, { cacheKey: `country:${code}:worldbank`, policy: CACHE_POLICIES.countryInfo })
    const c = Array.isArray(json) && Array.isArray(json[1]) ? json[1][0] : null
    if (!c) return null
    return { name: c.name, officialName: c.name, capital: c.capitalCity || 'Unavailable', languages: 'Unavailable from current provider', currency: 'Unavailable from current provider', timezones: 'Unavailable from current provider', callingCode: 'Unavailable from current provider', flag: '', population: null, region: c.region?.value || 'Unavailable', incomeLevel: c.incomeLevel?.value, coordinates: c.latitude && c.longitude ? { lat: Number(c.latitude), lon: Number(c.longitude) } : null, source: sourceMeta('World Bank country API', 'https://' + 'api.worldbank.org' + '/', CACHE_POLICIES.countryInfo.ttlMs, 'high'), visaDisclaimer: 'Entry requirements depend on nationality, passport, dates and purpose. Verify with official government or embassy sources before travel.', paymentAdvice: 'Currency, payment methods, plug type and visa details need a dedicated provider or official source before being shown as current facts.' }
  }
}

export class PlacesService {
  constructor(gateway) { this.gateway = gateway }
  async search(destination, kind = 'attractions') {
    if (!destination?.coordinates) return []
    const [s,w,n,e] = bboxAround(destination.coordinates, kind === 'accommodation' ? 9 : 12)
    const filter = kind === 'restaurants'
      ? 'node[amenity~"restaurant|cafe|fast_food|food_court"]({bbox});way[amenity~"restaurant|cafe|fast_food|food_court"]({bbox});relation[amenity~"restaurant|cafe|fast_food|food_court"]({bbox});'
      : kind === 'accommodation'
        ? 'node[tourism~"hotel|hostel|guest_house|apartment|resort|motel"]({bbox});way[tourism~"hotel|hostel|guest_house|apartment|resort|motel"]({bbox});relation[tourism~"hotel|hostel|guest_house|apartment|resort|motel"]({bbox});'
        : 'node[tourism~"museum|gallery|attraction|viewpoint|zoo|theme_park"]({bbox});way[tourism~"museum|gallery|attraction|viewpoint|zoo|theme_park"]({bbox});relation[tourism~"museum|gallery|attraction|viewpoint|zoo|theme_park"]({bbox});node[historic]({bbox});way[historic]({bbox});relation[historic]({bbox});node[leisure~"park|garden|beach_resort"]({bbox});way[leisure~"park|garden|beach_resort"]({bbox});'
    const query = `[out:json][timeout:18];(${filter.replaceAll('{bbox}', `${s},${w},${n},${e}`)});out center tags ${kind === 'attractions' ? POI_LIMITS.attractions * 3 : 30};`
    const url = `${'https://' + 'overpass-api.de'}/api/interpreter?data=${encodeURIComponent(query)}`
    const policy = kind === 'restaurants' ? CACHE_POLICIES.restaurantDiscovery : kind === 'accommodation' ? CACHE_POLICIES.accommodationDiscovery : CACHE_POLICIES.attractionDiscovery
    const json = await this.gateway.proxyJson(url, { cacheKey: `overpass:${kind}:${destination.id}`, policy })
    const places = (json.elements || []).map((el) => overpassElementToPlace(el, kind)).filter((p) => p.name && p.coordinates.lat && p.coordinates.lon)
    return rankPlaces(places, destination.coordinates, {}).slice(0, kind === 'attractions' ? POI_LIMITS.attractions : kind === 'restaurants' ? POI_LIMITS.restaurants : POI_LIMITS.accommodation)
  }
}

export class WeatherService {
  constructor(gateway) { this.gateway = gateway }
  async forTrip(destination, startDate, endDate) {
    if (!destination?.coordinates) return { kind: 'unavailable', message: 'Weather unavailable until a destination is selected.' }
    if (!dateWithinForecastRange(startDate)) return { kind: 'historical-needed', message: 'The trip is outside the reliable forecast window. A production build should connect a historical/climate provider and label it as typical weather, not a forecast.' }
    const params = new URLSearchParams({ latitude: String(destination.coordinates.lat), longitude: String(destination.coordinates.lon), daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max', timezone: 'auto', start_date: startDate, end_date: endDate || startDate })
    const url = `${'https://' + 'api.open-meteo.com'}/v1/forecast?${params}`
    const json = await this.gateway.proxyJson(url, { cacheKey: `weather:${destination.id}:${startDate}:${endDate}`, policy: CACHE_POLICIES.weatherForecast })
    const daily = json.daily || {}
    const first = daily.time?.[0]
    return { kind: 'forecast', source: sourceMeta('Open-Meteo', 'https://' + 'open-meteo.com' + '/', CACHE_POLICIES.weatherForecast.ttlMs, 'high'), days: (daily.time || []).map((date, i) => ({ date, min: daily.temperature_2m_min?.[i], max: daily.temperature_2m_max?.[i], rainProbability: daily.precipitation_probability_max?.[i] })), summary: first ? `${Math.round(daily.temperature_2m_min?.[0] ?? 0)}–${Math.round(daily.temperature_2m_max?.[0] ?? 0)}°C, rain probability ${daily.precipitation_probability_max?.[0] ?? 'n/a'}%` : 'Forecast returned without daily rows.' }
  }
}

export class AccommodationService { constructor(placesService) { this.placesService = placesService } async search(destination) { return this.placesService.search(destination, 'accommodation') } }
export class RestaurantService { constructor(placesService) { this.placesService = placesService } async search(destination) { return this.placesService.search(destination, 'restaurants') } }
export class FlightService { search({ origin, destination, startDate, endDate, travellers }) { const q = encodeURIComponent(`${origin?.city || ''} to ${destination?.city || ''} ${startDate || ''} ${endDate || ''} ${travellers || 1} passengers`); return [{ id: 'flight-fallback', mode: 'Plane', available: 'search-link-only', title: 'External flight search', description: 'No flight API credential is configured, so live prices are not shown.', bookingUrl: `${'https://' + 'www.google.com'}/travel/flights?q=${q}`, source: sourceMeta('FlightService fallback', 'https://' + 'www.google.com' + '/travel/flights', 0, 'low') }] } }
export class TransportService { compare({ origin, destination }) { const hasOrigin = !!origin?.coordinates, hasDestination = !!destination?.coordinates; return [{ id: 'plane', mode: 'Plane', reasonable: hasOrigin && hasDestination, detail: 'Use FlightService provider for real schedules/prices.' }, { id: 'car', mode: 'Car', reasonable: hasOrigin && hasDestination, detail: 'RoutingService scaffold estimates distance once routing provider is connected.' }, { id: 'train-bus', mode: 'Train / Bus', reasonable: hasOrigin && hasDestination, detail: 'Provider integration pending; show external search links only.' }] } }
export class ItineraryService { generate(input) { return buildItinerary(input) } }
export class TripService { createTripContext(trip, data) { return { tripId: trip.id, origin: trip.origin, destination: trip.destination, dates: { start: trip.startDate, end: trip.endDate }, travellers: { adults: trip.adults, children: trip.children, childAges: trip.childAges }, budget: trip.budget, preferences: { tripTypes: trip.tripTypes, interests: trip.interests, pace: trip.pace }, accommodation: data.accommodation?.[0] || null, transport: data.transport || [], itinerary: data.itinerary, weather: data.weather, savedPlaces: data.savedPlaces || [] } } }
export class AIService { answer(context, question) { const q = question.toLowerCase(); if (!context) return { text: 'Select or save a trip first so I can use its destination, dates, travellers, weather and itinerary context.', proposal: null }; if (q.includes('rain') || q.includes('weather')) return { text: `I checked the trip context. Weather data says: ${context.weather?.summary || context.weather?.message || 'not available'}. I would propose moving outdoor items after indoor alternatives are retrieved from PlacesService.`, proposal: { type: 'itinerary-change-preview', reason: 'Weather-sensitive change requires user approval before applying.', changes: ['Identify outdoor items', 'Find indoor museums/galleries nearby', 'Show Apply / Keep Original'] } }; if (q.includes('child') || q.includes('kid')) return { text: 'I would slow the pace, add rest windows, and prefer parks, short museums and easy food stops. Locked items would be preserved during regeneration.', proposal: null }; return { text: `I can answer using the structured trip context for ${context.destination?.formatted || context.destination?.city}. OpenAI integration is intentionally behind AIService; no live model key is configured in this MVP.`, proposal: null } } }

export function createServices(gateway) { const places = new PlacesService(gateway); return { providers: PROVIDERS, locationSearch: new LocationSearchService(gateway), countryInfo: new CountryInfoService(gateway), places, restaurants: new RestaurantService(places), accommodation: new AccommodationService(places), weather: new WeatherService(gateway), flights: new FlightService(), transport: new TransportService(), itinerary: new ItineraryService(), trip: new TripService(), ai: new AIService() } }
export async function loadDestinationBundle(services, destination) { const [country, attractions, restaurants, accommodation] = await Promise.allSettled([services.countryInfo.getByCountryCode(destination.countryCode), services.places.search(destination, 'attractions'), services.restaurants.search(destination), services.accommodation.search(destination)]); return { country: country.status === 'fulfilled' ? country.value : null, attractions: attractions.status === 'fulfilled' ? attractions.value : [], restaurants: restaurants.status === 'fulfilled' ? restaurants.value : [], accommodation: accommodation.status === 'fulfilled' ? accommodation.value : [], failures: [country, attractions, restaurants, accommodation].filter(r => r.status === 'rejected').map(r => r.reason?.message || 'Provider failed') } }
export { estimateBudget }
