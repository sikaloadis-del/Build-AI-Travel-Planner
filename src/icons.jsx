import React from 'react'

const paths = {
  Brain: 'M12 3a5 5 0 0 0-5 5v1a4 4 0 0 0 0 8v1a3 3 0 0 0 5 2 3 3 0 0 0 5-2v-1a4 4 0 0 0 0-8V8a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v10a1 1 0 0 1-2 0V6h-2v12a1 1 0 0 1-2 0V8a3 3 0 0 1 3-3Z',
  Calendar: 'M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  Chat: 'M5 5h14v10H8l-4 4V7a2 2 0 0 1 2-2Z',
  Check: 'm5 13 4 4L19 7',
  Globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2.5 2.3 4 5.4 4 9s-1.5 6.7-4 9c-2.5-2.3-4-5.4-4-9s1.5-6.7 4-9Z',
  GlobeRealTimeSearch: 'M12 21a9 9 0 1 1 8.2-5.3M3.6 9h16.8M3.6 15h10.2M12 3c2.2 2 3.6 4.8 3.9 8M12 21c-2.5-2.3-4-5.4-4-9s1.5-6.7 4-9m5 14 4 4m-2-6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  Heart: 'M20.8 8.6a5.4 5.4 0 0 0-9-4 5.4 5.4 0 0 0-9 4c0 5.4 9 10.4 9 10.4s9-5 9-10.4Z',
  Home: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-6v-6H9v6H4a1 1 0 0 1-1-1v-9Z',
  Lock: 'M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6V10Z',
  MapPin: 'M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  Maps: 'M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6',
  Plane: 'M2 16 22 3l-7 18-4-8-9-3Z',
  Search: 'M11 19a8 8 0 1 1 5.7-2.3L22 22',
  Star: 'm12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z',
  Trash: 'M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14',
  User: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
}

export function Icon({ name, size = 18, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.Globe}/></svg>
}

export const Brain = (p) => <Icon name="Brain" {...p}/>
export const Calendar = (p) => <Icon name="Calendar" {...p}/>
export const Chat = (p) => <Icon name="Chat" {...p}/>
export const Check = (p) => <Icon name="Check" {...p}/>
export const Globe = (p) => <Icon name="Globe" {...p}/>
export const GlobeRealTimeSearch = (p) => <Icon name="GlobeRealTimeSearch" {...p}/>
export const Heart = (p) => <Icon name="Heart" {...p}/>
export const Home = (p) => <Icon name="Home" {...p}/>
export const Lock = (p) => <Icon name="Lock" {...p}/>
export const MapPin = (p) => <Icon name="MapPin" {...p}/>
export const Maps = (p) => <Icon name="Maps" {...p}/>
export const Plane = (p) => <Icon name="Plane" {...p}/>
export const Search = (p) => <Icon name="Search" {...p}/>
export const Star = (p) => <Icon name="Star" {...p}/>
export const Trash = (p) => <Icon name="Trash" {...p}/>
export const User = (p) => <Icon name="User" {...p}/>
