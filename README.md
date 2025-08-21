# Weather Wear Jr 🌈

A kid-friendly weather application that helps children choose appropriate clothing based on the weather.

## Features

- 🌤️ Real-time weather display with fun animations
- 👕 Smart clothing recommendations based on temperature
- 🔊 High-quality AI text-to-speech with OpenAI (falls back to browser TTS)
- 📅 Live date and time display
- 🎨 Colorful, kid-friendly design

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and add your API keys:
   ```
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   WEATHER_ZIP_CODE=12345
   TEMPERATURE_UNIT=F
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Docker Deployment

1. Make sure you have Docker and Docker Compose installed
2. Create a `.env` file with your API credentials
3. Run:
   ```bash
   docker-compose up -d
   ```

## API Requirements

You'll need API keys from:
- [OpenWeatherMap](https://openweathermap.org/api) - Free tier is sufficient
- [OpenAI](https://platform.openai.com/api-keys) - For high-quality text-to-speech (optional, falls back to browser TTS)

## Technologies Used

- Next.js 14 with TypeScript
- React Server Components
- CSS Modules for styling
- OpenWeatherMap API
- OpenAI TTS API (with Web Speech API fallback)
- Docker for containerization