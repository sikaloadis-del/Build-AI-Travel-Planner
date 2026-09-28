import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Check, ChevronDown, ChevronUp, Globe, Heart, MapPin, Plus, Search, Sparkles, Star, Trash } from '@openai/apps-sdk-ui/components/Icon'

const CSS = `
  * { box-sizing: border-box; }
  .tp-root {
    min-height: 100%;
    color: var(--text);
    background:
      radial-gradient(circle at 12% 5%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 28rem),
      linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, var(--accent)), var(--bg));
    font-family: var(--font);
    padding: clamp(16px, 3vw, 32px);
  }
  .tp-shell { max-width: 1400px; margin: 0 auto; display: grid; gap: 18px; }
  .tp-hero {
    display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr); gap: 18px;
    align-items: stretch;
  }
  .tp-card, .tp-panel, .tp-search {
    background: color-mix(in srgb, var(--surface) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--border) 84%, transparent);
    border-radius: 28px;
    box-shadow: 0 24px 70px rgba(0,0,0,.14);
    backdrop-filter: blur(18px);
  }
  .tp-intro { padding: clamp(22px, 4vw, 42px); position: relative; overflow: hidden; }
  .tp-intro::after {
    content: ''; position: absolute; width: 260px; height: 260px; right: -70px; top: -80px;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent) 34%, transparent), transparent 70%);
    pointer-events: none;
  }
  .tp-kicker { display: inline-flex; gap: 8px; align-items: center; padding: 8px 12px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 13%, transparent); color: var(--accent); font-weight: 760; font-size: 13px; }
  .tp-title { margin: 18px 0 12px; font-size: clamp(36px, 7vw, 78px); line-height: .9; letter-spacing: -0.065em; }
  .tp-lede { max-width: 760px; color: var(--muted); font-size: clamp(16px, 2vw, 20px); line-height: 1.55; }
  .tp-pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 22px; }
  .tp-pill { border: 1px solid var(--border); background: var(--surface-2); color: var(--text); border-radius: 999px; padding: 8px 11px; font-size: 13px; display: inline-flex; align-items: center; gap: 7px; }
  .tp-search { padding: 18px; display: grid; gap: 13px; }
  .tp-search h2, .tp-section h2 { margin: 0; font-size: 22px; letter-spacing: -0.025em; }
  .tp-label { font-size: 12px; color: var(--muted); font-weight: 760; text-transform: uppercase; letter-spacing: .08em; }
  .tp-field { display: grid; gap: 7px; }
  .tp-input, .tp-select, .tp-textarea {
    width: 100%; min-height: 46px; border: 1px solid var(--border); border-radius: 15px;
    background: var(--bg); color: var(--text); padding: 11px 13px; font: inherit; outline: none;
  }
  .tp-textarea { min-height: 76px; resize: vertical; }
  .tp-input:focus, .tp-select:focus, .tp-textarea:focus, .tp-button:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 24%, transparent); border-color: var(--accent); }
  .tp-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 11px; }
  .tp-button { min-height: 46px; border: 0; border-radius: 15px; padding: 0 16px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: inherit; font-weight: 760; cursor: pointer; color: white; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #0f172a)); transition: transform .16s ease, filter .16s ease; }
  .tp-button:hover { transform: translateY(-1px); filter: brightness(1.04); }
  .tp-button.secondary { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
  .tp-button.ghost { min-height: 36px; border-radius: 12px; background: transparent; color: var(--text); border: 1px solid var(--border); padding: 0 11px; }
  .tp-tabs { display: flex; gap: 9px; overflow-x: auto; padding: 2px; }
  .tp-tab { flex: 0 0 auto; border: 1px solid var(--border); color: var(--muted); background: var(--surface); border-radius: 999px; padding: 10px 14px; font-weight: 760; cursor: pointer; }
  .tp-tab.active { color: white; background: var(--accent); border-color: transparent; }
  .tp-overview { display: grid; grid-template-columns: minmax(0, .82fr) minmax(340px, .5fr); gap: 18px; }
  .tp-panel { padding: 20px; }
  .tp-section { display: grid; gap: 15px; }
  .tp-meta-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
  .tp-meta { padding: 14px; border-radius: 18px; background: var(--surface-2); border: 1px solid var(--border); min-height: 86px; }
  .tp-meta strong { display: block; font-size: 18px; margin-top: 5px; }
  .tp-source { color: var(--muted); font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
  .tp-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 13px; }
  .tp-place { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; padding: 15px; display: grid; gap: 12px; position: relative; overflow: hidden; }
  .tp-place::before { content: ''; position: absolute; inset: 0 0 auto; height: 5px; background: linear-gradient(90deg, var(--accent), #f59e0b); opacity: .9; }
  .tp-place h3 { margin: 4px 0 0; font-size: 18px; letter-spacing: -0.02em; }
  .tp-muted { color: var(--muted); line-height: 1.45; }
  .tp-stats { display: flex; flex-wrap: wrap; gap: 8px; }
  .tp-stat { background: var(--surface-2); border-radius: 999px; padding: 6px 9px; font-size: 12px; display: inline-flex; align-items: center; gap: 5px; }
  .tp-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }
  .tp-map-wrap { display: grid; gap: 12px; }
  .tp-map { height: 430px; border-radius: 28px; position: relative; overflow: hidden; border: 1px solid var(--border); background:
    linear-gradient(90deg, color-mix(in srgb, var(--border) 45%, transparent) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--border) 45%, transparent) 1px, transparent 1px),
    radial-gradient(circle at 25% 30%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 28%),
    radial-gradient(circle at 70% 65%, rgba(245,158,11,.18), transparent 25%), var(--surface-2);
    background-size: 54px 54px,54px 54px,auto,auto,auto;
  }
  .tp-pin { position: absolute; transform: translate(-50%, -50%); display: grid; place-items: center; width: 36px; height: 36px; border-radius: 999px; color: white; border: 3px solid color-mix(in srgb, var(--surface) 75%, white); box-shadow: 0 12px 28px rgba(0,0,0,.24); font-weight: 900; font-size: 13px; }
  .tp-pin.attraction { background: var(--accent); } .tp-pin.stay { background: #f59e0b; } .tp-pin.food { background: #10b981; }
  .tp-map-label { position: absolute; left: 14px; bottom: 14px; right: 14px; padding: 12px; border-radius: 18px; background: color-mix(in srgb, var(--surface) 88%, transparent); border: 1px solid var(--border); color: var(--muted); }
  .tp-itinerary { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 13px; }
  .tp-day { border: 1px solid var(--border); background: var(--surface); border-radius: 22px; padding: 14px; display: grid; gap: 12px; align-content: start; }
  .tp-day h3 { margin: 0; font-size: 17px; }
  .tp-event { display: grid; grid-template-columns: 58px 1fr auto; gap: 10px; align-items: center; padding: 10px; border-radius: 16px; background: var(--surface-2); border: 1px solid color-mix(in srgb, var(--border) 70%, transparent); }
  .tp-time { color: var(--accent); font-weight: 820; font-size: 13px; }
  .tp-icon-btn { width: 34px; height: 34px; display: inline-grid; place-items: center; border-radius: 11px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; }
  .tp-budget { display: grid; gap: 10px; }
  .tp-budget-row { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
  .tp-bar { height: 9px; border-radius: 999px; background: var(--surface-2); overflow: hidden; margin-top: 6px; }
  .tp-bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), #f59e0b); border-radius: inherit; }
  .tp-total { border-radius: 20px; padding: 16px; background: color-mix(in srgb, var(--accent) 14%, var(--surface)); border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border)); display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 20px; font-weight: 860; }
  .tp-disclaimer { display: flex; gap: 10px; align-items: flex-start; padding: 13px; border-radius: 18px; background: color-mix(in srgb, #f59e0b 13%, var(--surface)); border: 1px solid color-mix(in srgb, #f59e0b 35%, var(--border)); color: var(--muted); }
  .tp-empty { text-align: center; padding: 24px; border: 1px dashed var(--border); border-radius: 22px; color: var(--muted); }
  @media (max-width: 1040px) { .tp-hero, .tp-overview { grid-template-columns: 1fr; } .tp-grid, .tp-itinerary { grid-template-columns: repeat(2, minmax(0,1fr)); } .tp-meta-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 680px) { .tp-root { padding: 12px; } .tp-intro, .tp-panel, .tp-search { border-radius: 22px; } .tp-form-grid, .tp-grid, .tp-itinerary { grid-template-columns: 1fr; } .tp-meta-grid { grid-template-columns: 1fr 1fr; } .tp-event { grid-template-columns: 48px 1fr; } .tp-event .tp-actions { grid-column: 1 / -1; } .tp-title { font-size: 42px; } }
  @media (prefers-reduced-motion: reduce) { .tp-button { transition: none; } .tp-button:hover { transform: none; } }
`

const DESTINATIONS = {
  Barcelona: {
    country: 'Spain', currency: 'Euro (€)', language: 'Spanish, Catalan', timezone: 'CET / CEST', weather: 'Warm and sunny in June, usually 20–27°C', dailyBudget: '€115–€190 per person', duration: '4–6 days', transport: 'Metro, buses and walking work well; T-casual cards are good value.',
    description: 'Barcelona blends Mediterranean beaches, Gaudí landmarks, Gothic lanes, food markets and late-evening neighbourhood life into a compact city that rewards smart clustering.',
    updated: 'Demo research snapshot · replace with live providers',
    coords: [
      ['Sagrada Família', 62, 26, 'attraction'], ['Park Güell', 42, 18, 'attraction'], ['Gothic Quarter', 50, 55, 'attraction'], ['Barceloneta', 70, 70, 'attraction'], ['Eixample stay', 48, 40, 'stay'], ['Tapas lunch', 56, 48, 'food']
    ],
    attractions: [
      ['Sagrada Família','4.8','150k+','1.5–2h','09:00–20:00','~€26','Gaudí’s unfinished basilica and Barcelona’s signature architectural icon.','Official site + Google style data'],
      ['Park Güell','4.4','190k+','1.5–2h','09:30–19:30','~€18','Colourful hillside gardens, mosaic terraces and city views.','Official site + tourism sources'],
      ['Casa Batlló','4.7','160k+','1–1.5h','09:00–22:00','~€35','A theatrical modernist townhouse with immersive interiors.','Official site'],
      ['Gothic Quarter','4.7','80k+','2h','Open area','Free','Medieval streets, plazas, shops and atmospheric evening walks.','Tourism board'],
      ['Picasso Museum','4.4','35k+','1.5h','Tue–Sun hours vary','~€14','A focused museum showing Picasso’s formative years.','Museum site'],
      ['La Boqueria Market','4.5','170k+','45–75m','08:00–20:30','Free entry','A lively food market ideal for snacks and local produce.','Market site'],
      ['Montjuïc','4.6','60k+','2–3h','Open area','Mostly free','Gardens, viewpoints, museums and the magic fountain area.','Tourism board'],
      ['Barcelona Cathedral','4.6','70k+','1h','09:30–18:30','~€14','Gothic cathedral at the heart of the old city.','Official site'],
      ['Barceloneta Beach','4.4','12k+','1–3h','Open area','Free','A convenient beach break close to seafood restaurants.','Maps + tourism sources'],
      ['Camp Nou Experience','4.6','120k+','1.5h','Varies during works','Varies','Football heritage and club museum experience.','Official site']
    ],
    stays: [
      ['Eixample boutique hotel','Hotel','4.6','9.0','650 m','€137/night','Balanced location for Gaudí sights, dining and metro connections.'],
      ['Gothic Quarter apartment','Apartment','4.4','8.7','300 m','€154/night','Best for travellers who want atmosphere and walkable evenings.'],
      ['Gràcia guest house','Guest house','4.7','9.2','1.8 km','€112/night','Strong value in a local neighbourhood near Park Güell.'],
      ['Beach hostel private room','Hostel','4.2','8.4','1.9 km','€86/night','Budget-friendly if Barceloneta and nightlife matter more than quiet.']
    ],
    restaurants: [
      ['El Nacional','Spanish / tapas','4.4','Near Passeig de Gràcia','€€','Good first-night food hall with broad choice.'],
      ['Bodega Biarritz','Tapas','4.7','Gothic Quarter','€€','Compact, popular tapas spot near the old town route.'],
      ['La Paradeta','Seafood','4.5','Sagrada Família area','€€','Casual seafood useful around a basilica visit.'],
      ['Granja Dulcinea','Dessert','4.6','Gothic Quarter','€','Classic stop for churros and hot chocolate.']
    ]
  },
  Lisbon: {
    country: 'Portugal', currency: 'Euro (€)', language: 'Portuguese', timezone: 'WET / WEST', weather: 'Mild shoulder seasons; warm, dry summers', dailyBudget: '€95–€165 per person', duration: '3–5 days', transport: 'Trams, metro, ferries and lots of hills; use clusters to avoid backtracking.',
    description: 'Lisbon is a hilly Atlantic capital with viewpoints, tiled streets, seafood, fado and easy day trips to Belém or Sintra.', updated: 'Demo research snapshot · replace with live providers',
    coords: [['Belém Tower',26,66,'attraction'],['Alfama',66,44,'attraction'],['Baixa stay',52,52,'stay'],['Time Out Market',44,70,'food'],['São Jorge Castle',60,38,'attraction']],
    attractions: [['Belém Tower','4.6','95k+','1h','10:00–17:30','~€8','Riverside Manueline tower and Lisbon postcard view.','Official site'],['Jerónimos Monastery','4.5','60k+','1.5h','10:00–17:30','~€12','Monumental monastery near pastéis and museums.','Official site'],['Alfama','4.7','40k+','2h','Open area','Free','Old lanes, viewpoints and fado restaurants.','Tourism board'],['São Jorge Castle','4.4','90k+','1.5h','09:00–21:00','~€15','Castle terraces with broad city views.','Official site'],['LX Factory','4.5','45k+','1–2h','Varies','Free entry','Creative shops, food and street art under the bridge.','Tourism sources']],
    stays: [['Baixa design hotel','Hotel','4.6','9.1','250 m','€128/night','Central, easy for first-time visitors.'],['Alfama apartment','Apartment','4.5','8.8','900 m','€116/night','Characterful but hilly; good for evenings.'],['Príncipe Real guest house','Guest house','4.7','9.3','1.1 km','€142/night','Calmer upscale base near restaurants.']],
    restaurants: [['Time Out Market','Portuguese variety','4.4','Cais do Sodré','€€','Efficient way to sample many Lisbon kitchens.'],['Cervejaria Ramiro','Seafood','4.5','Intendente','€€€','Famous seafood; book or queue.'],['Pastéis de Belém','Pastry','4.6','Belém','€','Classic custard tart stop near major sights.']]
  },
  Malaga: {
    country: 'Spain', currency: 'Euro (€)', language: 'Spanish', timezone: 'CET / CEST', weather: 'Warm, sunny and beach-friendly much of the year', dailyBudget: '€85–€145 per person', duration: '3–5 days', transport: 'Historic centre is walkable; buses and trains help with beaches and day trips.',
    description: 'Málaga pairs an easy old town, beaches, Picasso heritage, Andalusian food and sunshine with day-trip access along the Costa del Sol.', updated: 'Demo research snapshot · replace with live providers',
    coords: [['Alcazaba',54,44,'attraction'],['Picasso Museum',48,48,'attraction'],['Malagueta',72,64,'attraction'],['Centro stay',46,54,'stay'],['Atarazanas',42,56,'food']],
    attractions: [['Alcazaba','4.6','35k+','1.5h','09:00–20:00','~€3.50','Hilltop Moorish fortress with gardens and views.','Official site'],['Picasso Museum Málaga','4.3','28k+','1.5h','10:00–19:00','~€12','Major Picasso collection in his birth city.','Museum site'],['Málaga Cathedral','4.6','30k+','1h','10:00–18:30','~€10','Renaissance cathedral nicknamed La Manquita.','Official site'],['La Malagueta Beach','4.3','14k+','1–3h','Open area','Free','Urban beach within easy reach of the centre.','Tourism board'],['Atarazanas Market','4.5','20k+','45m','08:00–15:00','Free entry','Historic food market for tapas and produce.','Market info']],
    stays: [['Centro apartment','Apartment','4.5','8.9','200 m','€96/night','Great for a compact, food-focused city break.'],['Soho boutique hotel','Hotel','4.4','8.8','550 m','€118/night','Good balance of centre, station and waterfront.'],['Beach guest house','Guest house','4.3','8.5','1.7 km','€88/night','Better for relaxed beach-first pacing.']],
    restaurants: [['El Pimpi','Andalusian','4.2','Old town','€€','Classic atmosphere near cultural sights.'],['Casa Lola','Tapas','4.5','Centro','€€','Reliable tapas between museum stops.'],['Mercado Atarazanas','Market','4.5','Centro','€','Casual lunch browsing local stalls.']]
  }
}

const DISCOVERY = [
  { name: 'Malaga', why: 'Warm, family-friendly and budget-efficient for a five-day European break.' },
  { name: 'Lisbon', why: 'Mild weather, food, viewpoints and good value with short transfers.' },
  { name: 'Barcelona', why: 'Best if architecture, beaches and big-city food scenes matter most.' }
]
const styleLabels = ['Relaxed', 'Balanced', 'Intensive']
const interests = ['Sightseeing', 'Food', 'Museums', 'Family', 'Beaches', 'Adventure']

function money(n){ return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n) }
function daysBetween(start,end){ const a=new Date(start), b=new Date(end); if(!start||!end||isNaN(a)||isNaN(b)||b<a) return 5; return Math.max(1, Math.round((b-a)/86400000)+1) }
function clamp(n,min,max){ return Math.max(min, Math.min(max,n)) }
function makeItinerary(destination, intensity, selectedNames=[]){
  const data=DESTINATIONS[destination] || DESTINATIONS.Barcelona
  const pool=data.attractions.map(a=>a[0])
  const chosen=[...new Set([...selectedNames, ...pool])].slice(0, intensity==='Intensive'?9:intensity==='Relaxed'?5:7)
  const days=intensity==='Intensive'?3:intensity==='Relaxed'?2:3
  let idx=0
  return Array.from({length:days},(_,d)=>({
    title: d===0?'Arrival & central highlights':d===1?'Landmarks grouped nearby':'Flexible culture and food day',
    events: Array.from({length: d===0?3:intensity==='Relaxed'?2:3},(_,i)=>{
      const name=chosen[idx++ % chosen.length]
      const hour=[9,11,14,16][i] || 17
      return { id: `${Date.now()}-${d}-${i}-${name}`, time: `${String(hour).padStart(2,'0')}:30`, name, note: i===1?'Keep lunch close to this stop':'Grouped to reduce cross-city travel' }
    })
  }))
}

export default function App({ appId, token }) {
  const [destination, setDestination] = useState('Barcelona')
  const [dates, setDates] = useState({ start:'2026-06-10', end:'2026-06-15' })
  const [travellers, setTravellers] = useState(2)
  const [budget, setBudget] = useState(1500)
  const [style, setStyle] = useState('Balanced')
  const [selectedInterests, setSelectedInterests] = useState(['Sightseeing','Food'])
  const [prompt, setPrompt] = useState('I want somewhere warm in Europe for five days with food, culture and easy walking.')
  const [tab, setTab] = useState('Overview')
  const [favorites, setFavorites] = useState([])
  const [selected, setSelected] = useState(['Sagrada Família','Gothic Quarter'])
  const [itinerary, setItinerary] = useState(()=>makeItinerary('Barcelona','Balanced',['Sagrada Família','Gothic Quarter']))
  const [savedAt, setSavedAt] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(()=>{ let active=true; (async()=>{ try { const state=await window.mobius?.storage?.get('trip.json'); if(state && active){ setDestination(state.destination||'Barcelona'); setDates(state.dates||dates); setTravellers(state.travellers||2); setBudget(state.budget||1500); setStyle(state.style||'Balanced'); setSelectedInterests(state.selectedInterests||['Sightseeing','Food']); setFavorites(state.favorites||[]); setSelected(state.selected||[]); setItinerary(state.itinerary||makeItinerary(state.destination||'Barcelona', state.style||'Balanced', state.selected||[])); setSavedAt(state.savedAt||null) } } catch(e) { console.warn('Storage unavailable', e) } finally { if(active) setLoaded(true) } })(); return()=>{active=false} }, [])
  useEffect(()=>{ if(!loaded) return; const state={destination,dates,travellers,budget,style,selectedInterests,favorites,selected,itinerary,savedAt:new Date().toISOString()}; window.mobius?.storage?.set('trip.json', state).catch(()=>{}); setSavedAt(state.savedAt) }, [destination,dates,travellers,budget,style,selectedInterests,favorites,selected,itinerary,loaded])

  const data = DESTINATIONS[destination] || DESTINATIONS.Barcelona
  const tripDays = daysBetween(dates.start, dates.end)
  const stayNightly = parseInt((data.stays[0]?.[5]||'€120').replace(/\D/g,''),10) || 120
  const budgetRows = useMemo(()=>{
    const nights=Math.max(1,tripDays-1), baseFood=style==='Intensive'?58:style==='Relaxed'?42:50
    return [
      ['Accommodation', stayNightly*nights], ['Attractions', selected.length*18*travellers], ['Food', baseFood*tripDays*travellers], ['Local transport', 9*tripDays*travellers], ['Other expenses', Math.round(budget*.07)]
    ]
  },[stayNightly,tripDays,style,selected.length,travellers,budget])
  const total = budgetRows.reduce((s,r)=>s+r[1],0)
  const topCost = Math.max(...budgetRows.map(r=>r[1]),1)

  const regenerate = (nextDest=destination, nextStyle=style) => setItinerary(makeItinerary(nextDest,nextStyle,selected))
  const chooseDestination = (name) => { setDestination(name); const defaults=name==='Barcelona'?['Sagrada Família','Gothic Quarter']:[DESTINATIONS[name].attractions[0][0]]; setSelected(defaults); setItinerary(makeItinerary(name,style,defaults)); setTab('Overview') }
  const toggleInterest = (name) => setSelectedInterests(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name])
  const addPlace = (name) => { setSelected(v=>v.includes(name)?v:[...v,name]); setItinerary(days=>days.map((day,i)=> i===0 ? {...day, events:[...day.events,{id:`${Date.now()}-${name}`, time:'16:30', name, note:'Added by you'}]} : day)) }
  const removeEvent = (dayIndex, eventId) => setItinerary(days=>days.map((day,i)=> i===dayIndex ? {...day, events:day.events.filter(e=>e.id!==eventId)} : day))
  const moveEvent = (dayIndex, eventId, dir) => setItinerary(days=>days.map((day,i)=>{ if(i!==dayIndex) return day; const events=[...day.events]; const idx=events.findIndex(e=>e.id===eventId); const next=idx+dir; if(idx<0||next<0||next>=events.length) return day; [events[idx],events[next]]=[events[next],events[idx]]; return {...day, events} }))
  const toggleFavorite = (name) => setFavorites(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name])

  const tabs = ['Overview','Attractions','Stays','Itinerary','Map & budget']

  return <div className="tp-root"><style>{CSS}</style><main className="tp-shell">
    <section className="tp-hero">
      <div className="tp-card tp-intro">
        <div className="tp-kicker"><Sparkles size={16}/> Live-data-ready travel planning MVP</div>
        <h1 className="tp-title">Plan the whole trip, not just a list of places.</h1>
        <p className="tp-lede">Choose a destination or describe the kind of trip you want. The planner assembles an AI-style overview, ranked places, stays, food ideas, map clusters, budget and an editable daily route with source transparency.</p>
        <div className="tp-pills"><span className="tp-pill"><Globe size={14}/> {data.country}</span><span className="tp-pill"><Calendar size={14}/> {tripDays} days</span><span className="tp-pill"><Check size={14}/> Autosaved trip</span><span className="tp-pill">{selectedInterests.join(' · ')}</span></div>
      </div>
      <aside className="tp-search" aria-label="Trip setup">
        <h2>Trip setup</h2>
        <div className="tp-field"><span className="tp-label">Destination</span><select className="tp-select" value={destination} onChange={e=>chooseDestination(e.target.value)}>{Object.keys(DESTINATIONS).map(d=><option key={d}>{d}</option>)}</select></div>
        <div className="tp-form-grid"><div className="tp-field"><span className="tp-label">Start</span><input className="tp-input" type="date" value={dates.start} onChange={e=>setDates({...dates,start:e.target.value})}/></div><div className="tp-field"><span className="tp-label">End</span><input className="tp-input" type="date" value={dates.end} onChange={e=>setDates({...dates,end:e.target.value})}/></div></div>
        <div className="tp-form-grid"><div className="tp-field"><span className="tp-label">Travellers</span><input className="tp-input" type="number" min="1" max="12" value={travellers} onChange={e=>setTravellers(clamp(Number(e.target.value)||1,1,12))}/></div><div className="tp-field"><span className="tp-label">Budget (€)</span><input className="tp-input" type="number" min="200" step="50" value={budget} onChange={e=>setBudget(Number(e.target.value)||0)}/></div></div>
        <div className="tp-field"><span className="tp-label">Travel intensity</span><select className="tp-select" value={style} onChange={e=>{setStyle(e.target.value); regenerate(destination,e.target.value)}}>{styleLabels.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="tp-pills">{interests.map(i=><button key={i} className="tp-tab" aria-pressed={selectedInterests.includes(i)} onClick={()=>toggleInterest(i)} style={selectedInterests.includes(i)?{background:'var(--accent)',color:'white',borderColor:'transparent'}:{}}>{i}</button>)}</div>
        <div className="tp-field"><span className="tp-label">Destination discovery prompt</span><textarea className="tp-textarea" value={prompt} onChange={e=>setPrompt(e.target.value)}/></div>
        <div className="tp-actions"><button className="tp-button" onClick={()=>chooseDestination(DISCOVERY[0].name)}><Search size={16}/> Suggest destinations</button><button className="tp-button secondary" onClick={()=>regenerate()}><span aria-hidden="true">↻</span> Regenerate itinerary</button></div>
      </aside>
    </section>

    <nav className="tp-tabs" aria-label="Travel planner sections">{tabs.map(t=><button key={t} className={`tp-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>)}</nav>

    {tab==='Overview' && <section className="tp-overview"><div className="tp-panel tp-section"><div><span className="tp-source"><Sparkles size={14}/> AI summary · {data.updated}</span><h2>{destination}</h2><p className="tp-muted">{data.description}</p></div><div className="tp-meta-grid">{[['Country',data.country],['Currency',data.currency],['Language',data.language],['Time zone',data.timezone],['Weather',data.weather],['Daily budget',data.dailyBudget],['Best duration',data.duration],['Transport',data.transport]].map(([k,v])=><div className="tp-meta" key={k}><span className="tp-label">{k}</span><strong>{v}</strong></div>)}</div><Disclaimer /></div><div className="tp-panel tp-section"><h2>AI discovery shortlist</h2>{DISCOVERY.map(d=><div className="tp-place" key={d.name}><h3>{d.name}</h3><p className="tp-muted">{d.why}</p><button className="tp-button ghost" onClick={()=>chooseDestination(d.name)}>Use this destination</button></div>)}<span className="tp-source">Discovery prompt: “{prompt.slice(0,90)}{prompt.length>90?'…':''}”</span></div></section>}

    {tab==='Attractions' && <section className="tp-panel tp-section"><h2>Top attractions</h2><div className="tp-grid">{data.attractions.map(a=><PlaceCard key={a[0]} item={a} selected={selected.includes(a[0])} favorite={favorites.includes(a[0])} onAdd={()=>addPlace(a[0])} onFavorite={()=>toggleFavorite(a[0])}/>)}</div><Disclaimer /></section>}

    {tab==='Stays' && <section className="tp-panel tp-section"><h2>Recommended stays & food</h2><div className="tp-grid">{data.stays.map(s=><StayCard key={s[0]} item={s}/>)}</div><h2>Restaurants near planned areas</h2><div className="tp-grid">{data.restaurants.map(r=><FoodCard key={r[0]} item={r}/>)}</div><Disclaimer /></section>}

    {tab==='Itinerary' && <section className="tp-panel tp-section"><div className="tp-actions" style={{justifyContent:'space-between'}}><div><h2>Editable itinerary</h2><span className="tp-source">Considers selected interests, rough visit duration and nearby clustering in this demo.</span></div><button className="tp-button" onClick={()=>regenerate()}><span aria-hidden="true">↻</span> Regenerate full itinerary</button></div><div className="tp-itinerary">{itinerary.map((day,di)=><div className="tp-day" key={di}><h3>Day {di+1} – {day.title}</h3>{day.events.map((event,ei)=><div className="tp-event" key={event.id}><span className="tp-time">{event.time}</span><div><strong>{event.name}</strong><div className="tp-muted">{event.note}</div></div><div className="tp-actions"><button className="tp-icon-btn" aria-label="Move up" onClick={()=>moveEvent(di,event.id,-1)}><ChevronUp size={15}/></button><button className="tp-icon-btn" aria-label="Move down" onClick={()=>moveEvent(di,event.id,1)}><ChevronDown size={15}/></button><button className="tp-icon-btn" aria-label="Remove" onClick={()=>removeEvent(di,event.id)}><Trash size={15}/></button></div></div>)}</div>)}</div></section>}

    {tab==='Map & budget' && <section className="tp-overview"><div className="tp-panel tp-map-wrap"><h2>Map-style clustering</h2><div className="tp-map" role="img" aria-label="Simplified destination map with attraction, stay and food pins">{data.coords.map((c,i)=><div key={c[0]} className={`tp-pin ${c[3]}`} style={{left:`${c[1]}%`,top:`${c[2]}%`}} title={c[0]}>{i+1}</div>)}<div className="tp-map-label">Interactive map placeholder: blue = attractions, amber = stays, green = food. Later this can be backed by Google Maps with real coordinates and routing.</div></div></div><div className="tp-panel tp-section"><h2>Estimated trip budget</h2><div className="tp-budget">{budgetRows.map(([label,value])=><div className="tp-budget-row" key={label}><div><strong>{label}</strong><div className="tp-bar"><span style={{width:`${Math.round(value/topCost*100)}%`}} /></div></div><strong>{money(value)}</strong></div>)}</div><div className="tp-total"><span>Estimated total</span><span>{money(total)}</span></div><p className="tp-muted">Your target budget is {money(budget)}. {total<=budget?'This plan fits the target with room for changes.':'This plan is over target; reduce stays, paid attractions, or food allowance.'}</p><Disclaimer /></div></section>}
  </main></div>
}

function Disclaimer(){ return <div className="tp-disclaimer"><Globe size={18}/><div><strong>Live-data transparency</strong><br/>Prices, opening hours, ratings and availability can change. This MVP shows source labels and “last updated” patterns; connect live Google Places, official websites, Booking and weather providers before using it for real bookings.</div></div> }
function PlaceCard({item, selected, favorite, onAdd, onFavorite}){ return <article className="tp-place"><h3>{item[0]}</h3><div className="tp-stats"><span className="tp-stat"><Star size={13}/> {item[1]} · {item[2]}</span><span className="tp-stat">{item[3]}</span><span className="tp-stat">{item[5]}</span></div><p className="tp-muted">{item[6]}</p><span className="tp-source">Hours: {item[4]} · Source: {item[7]}</span><div className="tp-actions"><button className="tp-button ghost" onClick={onAdd}>{selected?<Check size={15}/>:<Plus size={15}/>} {selected?'In trip':'Add to itinerary'}</button><button className="tp-button ghost" onClick={onFavorite}><Heart size={15}/> {favorite?'Saved':'Favorite'}</button><button className="tp-button ghost"><MapPin size={15}/> Map</button></div></article> }
function StayCard({item}){ return <article className="tp-place"><h3>{item[0]}</h3><div className="tp-stats"><span className="tp-stat">{item[1]}</span><span className="tp-stat"><Star size={13}/> Google {item[2]}</span><span className="tp-stat">Booking {item[3]}</span></div><p className="tp-muted">{item[6]}</p><span className="tp-source">{item[4]} from centre · {item[5]} · Source: accommodation API placeholder</span><div className="tp-actions"><button className="tp-button ghost">View stay</button><button className="tp-button ghost"><MapPin size={15}/> Map</button></div></article> }
function FoodCard({item}){ return <article className="tp-place"><h3>{item[0]}</h3><div className="tp-stats"><span className="tp-stat">{item[1]}</span><span className="tp-stat"><Star size={13}/> {item[2]}</span><span className="tp-stat">{item[4]}</span></div><p className="tp-muted">{item[5]}</p><span className="tp-source">Area: {item[3]} · Source: restaurant search placeholder</span><div className="tp-actions"><button className="tp-button ghost"><MapPin size={15}/> Near route</button></div></article> }
