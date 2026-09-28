const DEFAULT_STATE = { trips: [], favorites: [], recentSearches: [] }
export async function loadUserState(storage) { try { return { ...DEFAULT_STATE, ...(await storage?.get('user-state.json')) } } catch { return DEFAULT_STATE } }
export async function saveUserState(storage, state) { try { await storage?.set('user-state.json', state); return true } catch { return false } }
export function addRecentSearch(state, destination) {
  if (!destination) return state
  const next = [destination, ...state.recentSearches.filter((d) => d.id !== destination.id)].slice(0, 8)
  return { ...state, recentSearches: next }
}
export function upsertTrip(state, trip) {
  const exists = state.trips.some((t) => t.id === trip.id)
  return { ...state, trips: exists ? state.trips.map((t) => t.id === trip.id ? trip : t) : [trip, ...state.trips] }
}
export function toggleFavorite(state, item) {
  const exists = state.favorites.some((f) => f.id === item.id)
  return { ...state, favorites: exists ? state.favorites.filter((f) => f.id !== item.id) : [{ ...item, savedAt: new Date().toISOString() }, ...state.favorites] }
}
