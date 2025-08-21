# Weather Wear Jr - Build Instructions

## Project Overview
Build a kid-friendly weather application called "Weather Wear Jr" that helps children choose appropriate clothing based on the weather. The app displays weather information in a visual, engaging way suitable for 5-year-olds and includes text-to-speech functionality.

## Technical Stack
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: CSS Modules or styled-components
- **API**: OpenWeatherMap API
- **Deployment**: Docker & Docker Compose
- **Version Control**: GitHub (username: yourbr0ther)

## Project Structure
```
weather-wear-jr/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── WeatherDisplay.tsx
│   │   ├── ClothingRecommendation.tsx
│   │   ├── SpeakButton.tsx
│   │   └── DateTimeDisplay.tsx
│   ├── lib/
│   │   ├── weather.ts
│   │   └── clothing.ts
│   └── types/
│       └── weather.ts
├── public/
├── .env.example
├── .env.local
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables
Create a `.env.example` file with:
```
OPENWEATHER_API_KEY=your_api_key_here
WEATHER_ZIP_CODE=12345
TEMPERATURE_UNIT=F
```

The actual `.env.local` file should never be committed to git.

## Core Features to Implement

### 1. Weather Data Fetching
- Create an API route at `/app/api/weather/route.ts`
- Fetch weather data from OpenWeatherMap API using the ZIP code
- Cache the response for 10 minutes to avoid excessive API calls
- Return both current weather and daily forecast (high/low temps)

### 2. Main Page Component (`app/page.tsx`)
- Server-side render the initial weather data
- Client-side updates every 30 minutes
- Responsive design that works on tablets and desktop screens

### 3. Weather Display Component
- Show current temperature in large, readable text
- Display weather icon (use emoji or custom icons)
- Show weather description in kid-friendly language
- Animate the weather icon (floating/bouncing effect)

### 4. Clothing Recommendation Logic (`lib/clothing.ts`)
```typescript
interface ClothingItem {
  icon: string;
  name: string;
}

interface ClothingRecommendation {
  items: ClothingItem[];
  advice: string;
}
```

Rules for clothing recommendations:
- **Large temperature variation (>15°F difference)**: Layered clothing
- **Hot (≥75°F)**: Light clothes, shorts, sun protection
- **Mild (60-74°F)**: Long sleeves, light jacket
- **Cool (40-59°F)**: Warm clothes, jacket
- **Cold (<40°F)**: Winter gear, multiple layers

### 5. Text-to-Speech Component
- Use Web Speech API (SpeechSynthesis)
- Adjustable speech rate (slower for kids)
- Friendly voice selection if available
- Speech content should include:
  - Greeting with day of week
  - Current weather description
  - Temperature
  - Clothing advice
  - Encouraging message

### 6. Visual Design Requirements
```css
/* Key design elements */
- Background: Gradient (purple to pink themed)
- Border radius: 20-30px for rounded corners
- Animations: Floating container, bouncing icons
- Colors: Bright, kid-friendly palette
- Font: Comic Sans MS or similar playful font
- Large touch targets for buttons (min 44px)
```

### 7. Docker Configuration

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD HOSTNAME="0.0.0.0" node server.js
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENWEATHER_API_KEY=${OPENWEATHER_API_KEY}
      - WEATHER_ZIP_CODE=${WEATHER_ZIP_CODE}
      - TEMPERATURE_UNIT=${TEMPERATURE_UNIT}
    restart: unless-stopped
```

## GitHub Setup
1. Initialize git repository
2. Create `.gitignore` with:
   ```
   node_modules/
   .next/
   .env.local
   .env
   *.log
   .DS_Store
   dist/
   ```
3. Initial commit structure:
   - `feat: initial project setup`
   - `feat: add weather API integration`
   - `feat: add clothing recommendation logic`
   - `feat: add text-to-speech functionality`
   - `feat: add Docker configuration`

## TypeScript Types
```typescript
// types/weather.ts
export interface WeatherData {
  temperature: number;
  high: number;
  low: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherAPIResponse {
  current: WeatherData;
  location: {
    city: string;
    state: string;
  };
}
```

## API Integration Notes
- OpenWeatherMap endpoint: `https://api.openweathermap.org/data/2.5/weather`
- Use `zip` parameter with country code (e.g., `12345,US`)
- Convert temperature based on TEMPERATURE_UNIT env variable
- Handle API errors gracefully with fallback messages

## Testing Checklist
- [ ] Weather data fetches correctly
- [ ] Temperature displays in correct unit (F/C)
- [ ] Clothing recommendations change based on temperature
- [ ] Text-to-speech works on button click
- [ ] Responsive design works on tablet/desktop
- [ ] Docker container builds and runs
- [ ] Environment variables load correctly
- [ ] Error states handled gracefully

## Deployment Instructions
1. Clone repository
2. Copy `.env.example` to `.env` and fill in values
3. Run `docker-compose up -d`
4. Access at `http://localhost:3000`

## Future Enhancements (not for initial build)
- Multiple language support
- Weather alerts/warnings
- Customizable character/mascot
- Historical weather patterns
- Multiple location support
- PWA capabilities for offline use