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