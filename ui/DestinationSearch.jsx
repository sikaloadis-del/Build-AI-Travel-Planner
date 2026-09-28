import React, { useEffect, useRef, useState } from 'react'
import { Search } from '../src/icons.jsx'

export function DestinationSearch({ services, onSelect, recent = [], label = 'Destination', countryCode = '' }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [active, setActive] = useState(0)
  async function runSearch(value = query, cancelled = () => false) {
    const term = String(value || '').trim()
    if(term.length < 2){ setResults([]); setError('Type at least 2 characters to search.'); return }
    setLoading(true); setError(`Searching ${term}…`)
    try { const r = await services.locationSearch.search(term,{countryCode}); if(!cancelled()){ setResults(r); setActive(0) } }
    catch(e){ if(!cancelled()) setError(e.message || 'Search failed') }
    finally { if(!cancelled()) setLoading(false) }
  }
  useEffect(()=>{ let cancelled=false; const timer=setTimeout(()=>runSearch(query, () => cancelled), 380); return()=>{ cancelled=true; clearTimeout(timer) } },[query,countryCode,services])
  function keyDown(e){ if(e.key==='Enter'){ e.preventDefault(); if(results.length) onSelect(results[active]); else runSearch(e.currentTarget.value); return } if(!results.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); setActive(a=>Math.min(results.length-1,a+1)) } if(e.key==='ArrowUp'){ e.preventDefault(); setActive(a=>Math.max(0,a-1)) } }
  return <div className="tp-searchbox"><div className="tp-field"><span className="tp-label">{label}</span><div style={{position:'relative'}}><Search size={17} style={{position:'absolute',left:14,top:15,color:'var(--muted)'}}/><input ref={inputRef} className="tp-input" style={{paddingLeft:42}} value={query} onInput={e=>setQuery(e.currentTarget.value)} onChange={e=>setQuery(e.currentTarget.value)} onKeyDown={keyDown} placeholder="Search any city, region or country…" aria-label={label}/></div></div><button className="tp-btn ghost" type="button" onClick={(event)=>{ const input = event.currentTarget.parentElement?.querySelector('input'); runSearch(input?.value || inputRef.current?.value || query) }}>Search destination</button>{loading && <span className="tp-source">Searching live location provider…</span>}{error && <span className="tp-source">{error}</span>}<div className="tp-results">{results.map((r,i)=><button className={`tp-result ${i===active?'active':''}`} key={r.id} onClick={()=>onSelect(r)}><strong>{r.city || r.formatted}</strong><br/><span className="tp-muted">{r.country} · {r.formatted}</span></button>)}</div>{!query && recent.length>0 && <div><span className="tp-label">Recent searches</span><div className="tp-chiprow">{recent.map(r=><button className="tp-chip" key={r.id} onClick={()=>onSelect(r)}>{r.city || r.formatted}</button>)}</div></div>}</div>
}

export function CountryCitySelector({ services, onSelect }) {
  const [country, setCountry] = useState('')
  return <div className="tp-searchbox"><h3>Country and city alternative</h3><div className="tp-field"><span className="tp-label">Country code</span><input className="tp-input" value={country} onChange={e=>setCountry(e.target.value.toUpperCase())} placeholder="Example: BA, IT, ES" maxLength={2}/><span className="tp-source">City results are still resolved dynamically through the location provider; no city list is maintained in the frontend.</span></div><DestinationSearch services={services} onSelect={onSelect} label="City in selected country" countryCode={country}/></div>
}
