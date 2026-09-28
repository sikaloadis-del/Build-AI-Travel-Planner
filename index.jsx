import React, { useEffect, useMemo, useState } from 'react'
import { CSS } from './theme.js'
import { DataGateway } from './gateway.js'
import { createServices } from './services.js'
import { addRecentSearch, loadUserState, saveUserState, toggleFavorite as toggleFav, upsertTrip } from './storage.js'
import { AppChrome, HomeScreen } from './ui/Chrome.jsx'
import { ExploreGuide } from './ui/ExploreGuide.jsx'
import { PlanTrip } from './ui/PlanTrip.jsx'
import { Favorites, MyTrips } from './ui/MyTrips.jsx'
import { AssistantPanel } from './ui/AssistantPanel.jsx'

export default function App({ appId, token }) {
  const [view,setView]=useState('home')
  const [userState,setUserState]=useState({ trips:[], favorites:[], recentSearches:[] })
  const [selectedDestination,setSelectedDestination]=useState(null)
  const [activeTrip,setActiveTrip]=useState(null)
  const storage=window.mobius?.storage
  const gateway=useMemo(()=>new DataGateway({ token, storage }),[token,storage])
  const services=useMemo(()=>createServices(gateway),[gateway])
  useEffect(()=>{ let active=true; loadUserState(storage).then(s=>{ if(active) setUserState(s) }); return()=>{active=false} },[storage])
  useEffect(()=>{ saveUserState(storage,userState) },[storage,userState])
  function onDestinationSelected(destination){ setUserState(s=>addRecentSearch(s,destination)) }
  function toggleFavorite(item){ setUserState(s=>toggleFav(s,item)) }
  function saveTrip(trip){ const saved={...trip, savedAt:new Date().toISOString()}; setUserState(s=>upsertTrip(s,saved)); setActiveTrip(saved); setView('assistant') }
  function openTrip(trip){ setActiveTrip(trip); setView('assistant') }
  function body(){
    if(view==='home') return <HomeScreen setView={setView}/>
    if(view==='explore') return <ExploreGuide services={services} userState={userState} selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination} onDestinationSelected={onDestinationSelected} toggleFavorite={toggleFavorite}/>
    if(view==='plan') return <PlanTrip services={services} userState={userState} saveTrip={saveTrip} activeTrip={activeTrip} setActiveTrip={setActiveTrip}/>
    if(view==='trips') return <MyTrips trips={userState.trips} openTrip={openTrip}/>
    if(view==='favorites') return <Favorites favorites={userState.favorites}/>
    if(view==='assistant') return <AssistantPanel services={services} trip={activeTrip} applyProposal={()=>{}}/>
    return <HomeScreen setView={setView}/>
  }
  return <><style>{CSS}</style><AppChrome view={view} setView={setView}>{body()}</AppChrome></>
}
