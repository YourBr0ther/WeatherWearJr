'use client';

import { useEffect, useState } from 'react';
import { WeatherData } from '@/types/weather';
import { getWeatherEmoji, getKidFriendlyDescription } from '@/lib/weather';
import styles from './WeatherDisplay.module.css';

interface WeatherDisplayProps {
  weather: WeatherData;
}

export default function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [weather]);

  const emoji = getWeatherEmoji(weather.condition);
  const friendlyDescription = getKidFriendlyDescription(weather.description);

  return (
    <div className={styles.container}>
      <div className={`${styles.emoji} ${isAnimating ? styles.bounce : ''}`}>
        {emoji}
      </div>
      <div className={styles.temperature}>
        {weather.temperature}°F
      </div>
      <div className={styles.description}>
        It's {friendlyDescription}!
      </div>
      <div className={styles.details}>
        <div className={styles.highLow}>
          <span className={styles.high}>High: {weather.high}°</span>
          <span className={styles.low}>Low: {weather.low}°</span>
        </div>
      </div>
    </div>
  );
}