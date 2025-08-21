'use client';

import { useEffect, useState } from 'react';
import styles from './DateTimeDisplay.module.css';

export default function DateTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const date = currentTime.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const time = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className={styles.container}>
      <div className={styles.day}>{dayOfWeek}</div>
      <div className={styles.date}>{date}</div>
      <div className={styles.time}>{time}</div>
    </div>
  );
}