import { WeatherAPIResponse } from '@/types/weather';

export async function fetchWeatherData(): Promise<WeatherAPIResponse> {
  const response = await fetch('/api/weather', {
    next: { revalidate: 600 } // Cache for 10 minutes
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  return response.json();
}

export function getWeatherEmoji(condition: string): string {
  const weatherEmojis: Record<string, string> = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  
  return weatherEmojis[condition] || '🌤️';
}

export function getKidFriendlyDescription(description: string): string {
  const friendlyDescriptions: Record<string, string> = {
    'clear sky': 'sunny and bright',
    'few clouds': 'mostly sunny',
    'scattered clouds': 'partly cloudy',
    'broken clouds': 'cloudy',
    'shower rain': 'rainy',
    'rain': 'rainy',
    'thunderstorm': 'stormy',
    'snow': 'snowy',
    'mist': 'foggy'
  };
  
  return friendlyDescriptions[description.toLowerCase()] || description;
}