import { FORECAST_RELIABLE_DAYS } from './config.js'

export function nowIso() { return new Date().toISOString() }
export function addMs(ms) { return new Date(Date.now() + ms).toISOString() }
export function sourceMeta(sourceName, sourceUrl, ttlMs, confidence = 'medium') {
  return { sourceName, sourceUrl, retrievedAt: nowIso(), expiresAt: ttlMs === Infinity ? null : addMs(ttlMs), confidence }
}
export function compactId(prefix = 'id') { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}` }
export function dayCount(startDate, endDate) {
  const a = new Date(startDate), b = new Date(endDate)
  if (!startDate || !endDate || Number.isNaN(a.valueOf()) || Number.isNaN(b.valueOf()) || b < a) return 3
  return Math.max(1, Math.round((b - a) / 86400000) + 1)
}
export function dateWithinForecastRange(startDate) {
  const d = new Date(startDate)
  if (!startDate || Number.isNaN(d.valueOf())) return false
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.floor((d - today) / 86400000)
  return diff >= 0 && diff <= FORECAST_RELIABLE_DAYS
}
export function formatDistanceKm(km) { return km == null ? 'Distance unavailable' : `${km.toFixed(km < 10 ? 1 : 0)} km` }
export function haversineKm(a, b) {
  if (!a || !b) return null
  const R = 6371, toRad = (n) => n * Math.PI / 180
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export function scorePlace(place, preferences = {}) {
  const reviewWeight = place.reviewCount ? Math.min(1, Math.log10(place.reviewCount + 1) / 4) : 0
  const ratingWeight = place.rating ? Math.max(0, (place.rating - 3) / 2) : 0.45
  const distanceWeight = place.distanceKm == null ? 0.55 : Math.max(0, 1 - place.distanceKm / 12)
  const categoryWeight = preferences.interests?.some((interest) => (place.category || '').toLowerCase().includes(interest.toLowerCase())) ? 1 : 0.55
  const availabilityWeight = place.availability === 'available' ? 1 : place.availability === 'unknown' ? 0.55 : 0.25
  return Math.round((ratingWeight * .25 + reviewWeight * .15 + distanceWeight * .25 + categoryWeight * .2 + availabilityWeight * .15) * 100)
}
export function rankPlaces(places, center, preferences = {}) {
  return places.map((p) => {
    const distanceKm = haversineKm(center, p.coordinates)
    const scored = { ...p, distanceKm }
    return { ...scored, recommendationScore: scorePlace(scored, preferences) }
  }).sort((a, b) => b.recommendationScore - a.recommendationScore)
}
export function groupByProximity(places) {
  const sorted = [...places].sort((a,b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99))
  return [sorted.filter((_, i) => i % 3 === 0), sorted.filter((_, i) => i % 3 === 1), sorted.filter((_, i) => i % 3 === 2)].filter(Boolean)
}
export function buildItinerary({ trip, attractions = [], restaurants = [], weather }) {
  const days = dayCount(trip.startDate, trip.endDate)
  const paceCount = trip.pace === 'Intensive' ? 4 : trip.pace === 'Relaxed' ? 2 : 3
  const ranked = rankPlaces(attractions, trip.destination?.coordinates, { interests: trip.interests })
  const clusters = groupByProximity(ranked)
  const result = []
  for (let day = 0; day < days; day++) {
    const cluster = clusters[day % Math.max(1, clusters.length)] || ranked
    const pool = cluster.length ? cluster : ranked
    const items = []
    items.push({ id: compactId('item'), type: 'transport', startTime: day === 0 ? 'Arrival' : '09:00', endTime: '', title: day === 0 ? 'Arrival and check-in window' : 'Start near your accommodation', locked: false, source: 'Trip form', reason: day === 0 ? 'First day should not start too aggressively.' : 'Keeps the daily route realistic.' })
    pool.slice(0, paceCount).forEach((place, i) => {
      const hour = [10, 12, 15, 17][i] || 18
      items.push({ id: compactId('item'), type: 'place', placeId: place.id, startTime: `${String(hour).padStart(2,'0')}:00`, endTime: `${String(hour + 1).padStart(2,'0')}:30`, title: place.name, locked: false, coordinates: place.coordinates, source: place.source?.sourceName || 'Provider', reason: `Selected from retrieved places and grouped to reduce backtracking. Internal score ${place.recommendationScore}/100.` })
      if (i === 1) {
        const food = restaurants[i % Math.max(restaurants.length, 1)]
        items.push({ id: compactId('item'), type: 'meal', startTime: '13:30', endTime: '14:30', title: food?.name || 'Lunch near current route', locked: false, coordinates: food?.coordinates, source: food?.source?.sourceName || 'Routing placeholder', reason: food ? 'Food stop selected from retrieved nearby restaurants.' : 'No restaurant provider result was available.' })
      }
    })
    const weatherNote = weather?.kind === 'forecast' ? `Forecast considered: ${weather.summary}` : weather?.message || 'Weather not available for this date.'
    result.push({ id: compactId('day'), dateOffset: day, title: day === 0 ? 'Arrival and orientation' : `Day ${day + 1} · clustered route`, weatherNote, items })
  }
  return { id: compactId('itinerary'), generatedAt: nowIso(), source: 'ItineraryService', algorithm: ['candidate places', 'internal scoring', 'rough proximity grouping', 'daily windows', 'AI explanation scaffold'], days: result }
}
export function estimateBudget({ trip, accommodation = [], attractions = [], transport = [] }) {
  const days = dayCount(trip.startDate, trip.endDate), travellers = Number(trip.adults || 1) + Number(trip.children || 0)
  const nights = Math.max(1, days - 1)
  const accommodationEstimate = accommodation[0]?.price?.amount ? accommodation[0].price.amount * nights : 120 * nights
  const attractionsEstimate = Math.min(6, attractions.length) * 18 * travellers
  const foodEstimate = days * travellers * (trip.tripTypes?.includes('Budget') ? 35 : 55)
  const localTransport = days * travellers * 8
  const transportEstimate = transport.find(t => t.estimatedCost)?.estimatedCost?.amount || 0
  const rows = [
    { label: 'Transportation', amount: transportEstimate, type: transportEstimate ? 'retrieved/linked estimate' : 'not priced yet' },
    { label: 'Accommodation', amount: accommodationEstimate, type: accommodation[0]?.price ? 'retrieved provider price' : 'planning estimate' },
    { label: 'Attractions', amount: attractionsEstimate, type: 'planning estimate' },
    { label: 'Food', amount: foodEstimate, type: 'planning estimate' },
    { label: 'Local transport', amount: localTransport, type: 'planning estimate' },
  ]
  return { currency: 'EUR', rows, total: rows.reduce((s, r) => s + (r.amount || 0), 0) }
}
export function explainProviderStatus(providers) {
  return Object.values(providers).map(p => `${p.name}: ${p.mode}${p.requiresKey ? ' (credential-backed adapter pending)' : ''}`).join(' · ')
}
