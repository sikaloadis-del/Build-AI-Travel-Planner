import React from 'react'
import { Brain, Calendar, GlobeRealTimeSearch, Heart, Home, Maps, Plane, Search, User } from '../src/icons.jsx'

export function AppChrome({ view, setView, children }) {
  const nav = [
    ['home', 'Home', Home], ['explore', 'Explore', Search], ['plan', 'Plan Trip', Calendar], ['trips', 'My Trips', Plane], ['favorites', 'Favorites', Heart]
  ]
  return <div className="tp-root"><div className="tp-app">
    <header className="tp-top"><div className="tp-brand"><div className="tp-logo"><GlobeRealTimeSearch size={22}/></div><span>AI Travel Planner</span></div><nav className="tp-nav" aria-label="Main navigation">{nav.map(([key,label,Icon])=><button key={key} className={view===key?'active':''} onClick={()=>setView(key)}><Icon size={16}/>{label}</button>)}</nav></header>
    {children}
  </div></div>
}

export function HomeScreen({ setView }) {
  return <section className="tp-hero">
    <div className="tp-panel tp-hero-copy">
      <span className="tp-kicker"><Brain size={16}/> Travel discovery + live information + AI reasoning</span>
      <h1 className="tp-title">Dynamic travel planning, built on provider data.</h1>
      <p className="tp-lede">Research destinations or build full trips from live/recently retrieved sources. The frontend displays normalized domain data; provider calls are isolated behind services with cache, source metadata and graceful fallbacks.</p>
      <div className="tp-mode-grid">
        <button className="tp-mode" onClick={()=>setView('explore')}><div><h3>Inform Yourself</h3><p className="tp-muted">Search a real destination, then open a guide with country info, city context, places, stays, food and a coordinate map.</p></div><span className="tp-chip live">Start researching</span></button>
        <button className="tp-mode" onClick={()=>setView('plan')}><div><h3>Plan a Trip</h3><p className="tp-muted">Resolve origin and destination, set dates and travellers, compare transport, load weather, generate a structured itinerary and save the trip.</p></div><span className="tp-chip live">Build itinerary</span></button>
      </div>
    </div>
    <div className="tp-searchbox">
      <h2>Architecture foundation</h2>
      <InfoLine title="Frontend" body="React component shell using normalized domain objects, not destination-specific content." />
      <InfoLine title="Service layer" body="LocationSearch, Places, Accommodation, Restaurant, Weather, Flight, Transport, Itinerary, Trip and AI services." />
      <InfoLine title="Current real providers" body="Nominatim, REST Countries, Overpass/OpenStreetMap and Open‑Meteo through the app proxy." />
      <InfoLine title="Provider seams" body="Google Places/Maps, Booking, OpenAI, routing, flights and PostgreSQL are documented adapters, not hardcoded placeholders." />
    </div>
  </section>
}

export function InfoLine({ title, body }) { return <div className="tp-card"><h3>{title}</h3><p className="tp-muted">{body}</p></div> }
export function LoadingCards({ count = 3 }) { return <div className="tp-grid">{Array.from({ length: count }, (_, i) => <div className="tp-skeleton" key={i}/>)}</div> }
export function ErrorNotice({ message, retry }) { return <div className="tp-card topline"><h3>Something could not load</h3><p className="tp-muted">{message}</p>{retry && <button className="tp-btn ghost" onClick={retry}>Retry</button>}</div> }
export function SourceLine({ source }) { if(!source) return <span className="tp-source">Source unavailable</span>; return <span className="tp-source">Source: {source.sourceName} · Updated {new Date(source.retrievedAt).toLocaleString()} · Confidence {source.confidence}</span> }
export function ProviderBadge({ provider }) { return <span className={`tp-chip ${provider.mode.includes('real') ? 'live' : 'warn'}`}>{provider.name}: {provider.mode}</span> }
export function SectionHeader({ title, children }) { return <div className="tp-section-title"><div><h2>{title}</h2></div><div className="tp-chiprow">{children}</div></div> }
export function EmptyState({ title, body, action }) { return <div className="tp-empty"><h3>{title}</h3><p>{body}</p>{action}</div> }
export function Money({ amount, currency='EUR' }) { return <>{new Intl.NumberFormat('en-GB', { style:'currency', currency, maximumFractionDigits:0 }).format(amount || 0)}</> }
export function PinMap({ destination, places = [], restaurants = [], accommodation = [], origin }) {
  const all = [origin && { ...origin, mapKind:'origin' }, destination && { ...destination, mapKind:'destination', name: destination.city || destination.formatted }, ...places.map(p=>({...p,mapKind:'place'})), ...restaurants.map(p=>({...p,mapKind:'food'})), ...accommodation.map(p=>({...p,mapKind:'stay'}))].filter(Boolean).filter(p=>p.coordinates)
  const lats=all.map(p=>p.coordinates.lat), lons=all.map(p=>p.coordinates.lon); const minLat=Math.min(...lats), maxLat=Math.max(...lats), minLon=Math.min(...lons), maxLon=Math.max(...lons)
  const pos=(p)=>({ left: `${10 + 80*((p.coordinates.lon-minLon)/((maxLon-minLon)||1))}%`, top: `${90 - 80*((p.coordinates.lat-minLat)/((maxLat-minLat)||1))}%` })
  return <div className="tp-map" role="img" aria-label="Coordinate map preview">{all.slice(0,24).map((p,i)=><div key={p.id || i} className={`tp-pin ${p.mapKind==='food'?'food':p.mapKind==='stay'?'stay':p.mapKind==='origin'?'origin':''}`} style={pos(p)} title={p.name || p.formatted}>{i+1}</div>)}<div className="tp-mapnote">Coordinate preview. Production MapsService can swap this surface for Google Maps/Mapbox with routes and click-through details.</div></div>
}
export { Maps, User }
