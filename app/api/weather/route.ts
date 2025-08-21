import { NextResponse } from 'next/server';
import { WeatherAPIResponse } from '@/types/weather';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_ZIP_CODE = process.env.WEATHER_ZIP_CODE || '12345';
const TEMPERATURE_UNIT = process.env.TEMPERATURE_UNIT || 'F';

let cachedData: { data: WeatherAPIResponse; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    // Check cache
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedData.data);
    }

    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured');
    }

    // Fetch current weather
    const units = TEMPERATURE_UNIT === 'F' ? 'imperial' : 'metric';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${WEATHER_ZIP_CODE},US&appid=${OPENWEATHER_API_KEY}&units=${units}`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const weatherData = await weatherResponse.json();

    // Fetch forecast for high/low
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${WEATHER_ZIP_CODE},US&appid=${OPENWEATHER_API_KEY}&units=${units}&cnt=8`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      throw new Error('Failed to fetch forecast data');
    }
    
    const forecastData = await forecastResponse.json();

    // Calculate today's high and low from forecast
    const todayTemps = forecastData.list.map((item: any) => item.main.temp);
    const high = Math.max(...todayTemps);
    const low = Math.min(...todayTemps);

    const response: WeatherAPIResponse = {
      current: {
        temperature: Math.round(weatherData.main.temp),
        high: Math.round(high),
        low: Math.round(low),
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed)
      },
      location: {
        city: weatherData.name,
        state: 'US'
      }
    };

    // Update cache
    cachedData = { data: response, timestamp: Date.now() };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}