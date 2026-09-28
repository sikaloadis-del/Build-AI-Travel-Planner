# AI Travel Planner

A modern AI-powered travel platform foundation for researching destinations and planning complete trips with source-aware, dynamically retrieved data.

## Product overview

The app has two primary workflows:

1. **Inform Yourself** — search a real destination dynamically and open a destination guide.
2. **Plan a Trip** — resolve origin/destination, dates, travellers and preferences, then generate a structured trip context, itinerary, map preview and budget.

The core product principle is that the app must not be a static travel website. Destination-specific facts are retrieved through provider services or shown as unavailable/pending when a provider is not configured.

## Current implementation in Möbius

This package runs as a Möbius mini-app, so the live code is a React app inside an opaque iframe. Mini-apps cannot run their own Node/Next server process inside the app package. The rebuild therefore establishes the **same boundaries a backend would expose** inside modular services, and uses the Möbius `/api/proxy` for keyless public providers.

Current real/keyless providers:

- `LocationSearchService` → OpenStreetMap Nominatim
- `CountryInfoService` → World Bank country API (limited stable metadata)
- `PlacesService`, `AccommodationService`, `RestaurantService` → Overpass / OpenStreetMap tags
- `WeatherService` → Open-Meteo forecast when dates are inside the reliable forecast window

Scaffolded adapters:

- Google Places / Maps
- Booking or other accommodation API
- Flight API
- Routing API
- OpenAI-backed `AIService`
- PostgreSQL/Prisma backend persistence

## Architecture

```text
Web / future mobile client
↓
Backend API (future Next.js/Node service)
↓
Application / orchestration layer
↓
Domain services and provider interfaces
↓
Database + cache + external providers
↓
AI reasoning layer using retrieved facts
```

Current source layout:

```text
index.jsx                  # thin app composition
config.js                  # providers, cache TTLs, env var list
domain.js                  # pure scoring, budget, itinerary helpers
gateway.js                 # proxy fetch, cache, logging, request dedupe
services.js                # service interfaces + current providers
storage.js                 # user-owned trips/favorites/recent searches
theme.js                   # scoped CSS string
ui/                        # feature components
.env.example               # server-side variable names only
```

## Data model direction

Future backend entities:

- User
- Trip
- TripTraveller
- TripPreference
- TripDay
- ItineraryItem
- SavedPlace
- Favorite
- AccommodationSelection
- TransportationSelection
- TripBudget
- AIConversation
- AIMessage
- CachedExternalResult
- ExternalSource

User-owned trip data must be separated from temporary provider cache data.

## Cache strategy

TTL rules are centralized in `config.js`:

- country information: long cache
- city information: longer cache
- attraction discovery: medium cache
- restaurants: medium cache
- accommodation discovery: shorter cache
- weather: short cache
- trip drafts: user-owned data

Provider results include source metadata where available: `sourceName`, `sourceUrl`, `retrievedAt`, `expiresAt`, and confidence.

## Provider modes

The app supports a hybrid mode:

- **real keyless providers** for search/country/OSM/weather
- **scaffold providers** where paid or credentialed APIs are required
- **mock only at service boundary**, never embedded as destination-specific UI content

To add a production provider, implement the same service method and map raw responses into internal domain models such as `Destination`, `Place`, `Accommodation`, `WeatherForecast`, `Route`, `Itinerary` and `TripContext`.

## Environment variables

See `.env.example`. These are for a server-side backend only. Private API keys must never be placed in frontend code.

## Known limitations

- Google/Booking ratings, review counts, hotel prices and availability are not available until credentialed providers are connected.
- OpenStreetMap does not provide official ratings or reviews; those fields remain unavailable rather than fabricated.
- Flight search currently provides a fallback external search link only.
- City history, visa details and official ticket prices need official/certified data providers and legal/source disclaimers.
- AI assistant is a structured scaffold until OpenAI is connected server-side.

## Future mobile architecture

A React Native / Expo app can reuse the same backend API, database, saved trips, provider services, AI orchestration and user accounts. The mobile app should consume normalized API responses rather than talking directly to Google, Booking, OpenAI or flight providers.
