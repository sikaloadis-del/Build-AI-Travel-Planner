import React, { useEffect, useRef, useState } from 'react'
import { Search } from '../src/icons.jsx'

export function DestinationSearch({ services, onSelect, recent = [], label = 'Destination', countryCode = '', placeholder = 'Search any city, region or country…' }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [active, setActive] = useState(0)

  async function runSearch(value = query, cancelled = () => false) {
    const term = String(value || '').trim()
    if (term.length < 2) {
      setResults([])
      setMessage(term ? 'Type at least 2 characters to search.' : '')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const found = await services.locationSearch.search(term, { countryCode })
      if (cancelled()) return
      setResults(found)
      setActive(0)
      setMessage(found.length ? '' : `No places found for “${term}”. Try a broader spelling or remove the country filter.`)
    } catch (error) {
      if (!cancelled()) {
        setResults([])
        setMessage(error.message || 'Search failed. Please try again.')
      }
    } finally {
      if (!cancelled()) setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => runSearch(query, () => cancelled), 380)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query, countryCode, services])

  function keyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (results.length) onSelect(results[active])
      else runSearch(event.currentTarget.value)
      return
    }
    if (!results.length) return
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(results.length - 1, value + 1)) }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(0, value - 1)) }
  }

  return <div className="tp-searchbox">
    <div className="tp-field">
      <span className="tp-label">{label}</span>
      <div style={{ position: 'relative' }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--muted)' }} />
        <input ref={inputRef} className="tp-input" style={{ paddingLeft: 42 }} value={query} onInput={(event) => setQuery(event.currentTarget.value)} onChange={(event) => setQuery(event.currentTarget.value)} onKeyDown={keyDown} placeholder={placeholder} aria-label={label} />
      </div>
    </div>
    <button className="tp-btn ghost" type="button" onClick={() => runSearch(inputRef.current?.value || query)}>Search destination</button>
    {loading && <span className="tp-source">Searching live location provider…</span>}
    {!loading && message && <span className="tp-source">{message}</span>}
    <div className="tp-results">{results.map((result, index) => <button className={`tp-result ${index === active ? 'active' : ''}`} key={result.id} onClick={() => onSelect(result)}><strong>{result.city || result.formatted}</strong><br /><span className="tp-muted">{result.country} · {result.formatted}</span></button>)}</div>
    {!query && recent.length > 0 && <div><span className="tp-label">Recent searches</span><div className="tp-chiprow">{recent.map((result) => <button className="tp-chip" key={result.id} onClick={() => onSelect(result)}>{result.city || result.formatted}</button>)}</div></div>}
  </div>
}

export function CountryCitySelector({ services, onSelect }) {
  const [countryQuery, setCountryQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    const term = countryQuery.trim()
    if (term.length < 2) {
      setCountries([])
      setMessage('')
      return () => { cancelled = true }
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      setMessage('')
      try {
        const found = await services.countryInfo.searchCountries(term)
        if (cancelled) return
        setCountries(found)
        setMessage(found.length ? '' : `No countries found for “${term}”.`)
      } catch (error) {
        if (!cancelled) setMessage(error.message || 'Country search failed.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [countryQuery, services])

  function chooseCountry(country) {
    setSelectedCountry(country)
    setCountryQuery(country.name)
    setCountries([])
    setMessage('')
  }

  return <div className="tp-searchbox">
    <h3>Country and city alternative</h3>
    <div className="tp-field">
      <span className="tp-label">Country</span>
      <input className="tp-input" value={countryQuery} onChange={(event) => { setCountryQuery(event.target.value); setSelectedCountry(null) }} placeholder="Bosnia and Herzegovina, Spain, Germany…" />
      <span className="tp-source">Countries are loaded from the provider, then city search is filtered to the selected country.</span>
    </div>
    {loading && <span className="tp-source">Searching countries…</span>}
    {!loading && message && <span className="tp-source">{message}</span>}
    <div className="tp-results">{countries.map((country) => <button className="tp-result" key={country.code} onClick={() => chooseCountry(country)}><strong>{country.name}</strong><br /><span className="tp-muted">{country.region || 'Country'} · {country.code}</span></button>)}</div>
    {selectedCountry && <DestinationSearch services={services} onSelect={onSelect} label={`City in ${selectedCountry.name}`} countryCode={selectedCountry.code} placeholder={`Search a city in ${selectedCountry.name}…`} />}
  </div>
}
