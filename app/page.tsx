'use client';

import { Suspense, useEffect, useState } from 'react';
import WeatherDisplay from '@/components/WeatherDisplay';
import ClothingRecommendation from '@/components/ClothingRecommendation';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import SpeakButton from '@/components/SpeakButton';
import FactButton from '@/components/FactButton';
import { getClothingRecommendation } from '@/lib/clothing';
import { WeatherAPIResponse } from '@/types/weather';
import styles from './page.module.css';

async function getWeatherData(): Promise<WeatherAPIResponse | null> {
  try {
    const response = await fetch('/api/weather', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingIcon}>🌤️</div>
      <p>Loading weather data...</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>☔</div>
      <h2>Oops! Weather is hiding!</h2>
      <p>We couldn't get the weather right now. Please try again later!</p>
    </div>
  );
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await getWeatherData();
      if (data) {
        setWeatherData(data);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    fetchWeather();

    // Calculate milliseconds until 6 AM tomorrow
    const now = new Date();
    const tomorrow6AM = new Date(now);
    tomorrow6AM.setDate(tomorrow6AM.getDate() + 1);
    tomorrow6AM.setHours(6, 0, 0, 0);
    
    const msUntil6AM = tomorrow6AM.getTime() - now.getTime();

    let dailyInterval: NodeJS.Timeout | null = null;

    // Set initial timeout for 6 AM
    const initial6AMTimeout = setTimeout(() => {
      fetchWeather();
      
      // Set up daily interval starting from 6 AM
      dailyInterval = setInterval(fetchWeather, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntil6AM);

    // Also refresh every 30 minutes during the day
    const refreshInterval = setInterval(fetchWeather, 30 * 60 * 1000); // 30 minutes

    return () => {
      clearTimeout(initial6AMTimeout);
      clearInterval(refreshInterval);
      if (dailyInterval) {
        clearInterval(dailyInterval);
      }
    };
  }, []);

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <LoadingState />
        </div>
      </main>
    );
  }

  if (error || !weatherData) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <ErrorState />
        </div>
      </main>
    );
  }

  const clothing = getClothingRecommendation(
    weatherData.current.temperature,
    weatherData.current.high,
    weatherData.current.low
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Weather Wear Jr 🌈</h1>
        
        <Suspense fallback={<LoadingState />}>
          <DateTimeDisplay />
          <WeatherDisplay weather={weatherData.current} />
          <ClothingRecommendation recommendation={clothing} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh', width: '100%', alignItems: 'center', marginTop: 'auto' }}>
            <SpeakButton 
              weather={weatherData.current} 
              recommendation={clothing}
              location={weatherData.location.city}
            />
            <FactButton />
          </div>
        </Suspense>
      </div>
    </main>
  );
}