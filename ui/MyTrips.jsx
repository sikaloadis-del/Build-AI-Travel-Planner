import React from 'react'
import { EmptyState, Money } from './Chrome.jsx'

export function MyTrips({ trips, openTrip }) {
  if(!trips.length) return <EmptyState title="No saved trips yet" body="Generate a trip, then save it here. Saved trips keep destination, dates, travellers, preferences, itinerary, budget and provider snapshots."/>
  return <section className="tp-panel"><h2>My Trips</h2><div className="tp-grid">{trips.map(t=><div className="tp-card topline" key={t.id}><h3>{t.destination?.city || t.destination?.formatted}</h3><p className="tp-muted">{t.startDate} → {t.endDate}</p><div className="tp-chiprow"><span className="tp-chip">{t.adults} adults</span><span className="tp-chip">{t.children} children</span><span className="tp-chip live"><Money amount={t.budget?.total || 0}/></span></div><p className="tp-source">Saved context includes itinerary, weather response type, selected providers and budget estimates.</p><button className="tp-btn primary" onClick={()=>openTrip(t)}>Open trip</button></div>)}</div></section>
}
export function Favorites({ favorites }) {
  if(!favorites.length) return <EmptyState title="No favorites yet" body="Save destinations, places, restaurants or stays from Explore. Favorites can later be added to trips."/>
  return <section className="tp-panel"><h2>Favorites</h2><div className="tp-grid">{favorites.map(f=><div className="tp-card" key={`${f.id}-${f.savedAt || ''}`}><h3>{f.name || f.city || f.formatted}</h3><p className="tp-muted">{f.kind || f.category || f.country}</p><p className="tp-source">Saved {f.savedAt ? new Date(f.savedAt).toLocaleString() : 'recently'}</p></div>)}</div></section>
}
