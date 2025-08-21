'use client';

import { useState, useRef } from 'react';
import { WeatherData } from '@/types/weather';
import { ClothingRecommendation } from '@/lib/clothing';
import { getKidFriendlyDescription } from '@/lib/weather';
import styles from './SpeakButton.module.css';

interface SpeakButtonProps {
  weather: WeatherData;
  recommendation: ClothingRecommendation;
  location: string;
}

export default function SpeakButton({ weather, recommendation, location }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateMessage = () => {
    const friendlyDescription = getKidFriendlyDescription(weather.description);
    
    // More excited temperature descriptions for kids
    let tempDescription = '';
    if (weather.temperature >= 75) {
      tempDescription = "WOW, it's super hot today!";
    } else if (weather.temperature >= 60) {
      tempDescription = "YAY, it's nice and warm today!";
    } else if (weather.temperature >= 40) {
      tempDescription = "Hey, it's chilly today!";
    } else {
      tempDescription = "Brrr, it's really cold today!";
    }
    
    // Check for rain with more excitement
    const willRain = weather.condition.toLowerCase().includes('rain') || 
                    weather.condition.toLowerCase().includes('drizzle') || 
                    weather.condition.toLowerCase().includes('storm');
    
    const rainWarning = willRain ? " And guess what - it might rain, so stay nice and dry!" : "";
    
    // Keep clothing simple - just the most important items
    const mainClothing = recommendation.items.slice(0, 2).map(item => item.name).join(' and ');
    
    return `Hi there, superstar! ${tempDescription}${rainWarning} Today you should wear your ${mainClothing}. Have an amazing day!`;
  };

  const speakWithOpenAI = async () => {
    try {
      setIsLoading(true);
      const message = generateMessage();

      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
      } else {
        audioRef.current = new Audio(audioUrl);
      }

      audioRef.current.onloadstart = () => setIsSpeaking(true);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Fallback to Web Speech API
        speakWithWebAPI();
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      // Fallback to Web Speech API
      speakWithWebAPI();
    } finally {
      setIsLoading(false);
    }
  };

  const speakWithWebAPI = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const message = generateMessage();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, text-to-speech is not supported!');
    }
  };

  const speak = () => {
    // Try OpenAI first, fallback to Web Speech API
    speakWithOpenAI();
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  };

  const getButtonText = () => {
    if (isLoading) return 'Generating Voice...';
    if (isSpeaking) return 'Stop Speaking';
    return 'Hear Today\'s Weather';
  };

  const getButtonIcon = () => {
    if (isLoading) return '⏳';
    if (isSpeaking) return '🔇';
    return '🔊';
  };

  return (
    <button
      className={`${styles.button} ${isSpeaking ? styles.speaking : ''} ${isLoading ? styles.loading : ''}`}
      onClick={isSpeaking || isLoading ? stopSpeaking : speak}
      disabled={isLoading}
      aria-label={isLoading ? 'Loading' : isSpeaking ? 'Stop speaking' : 'Speak weather information'}
    >
      <span className={styles.icon}>{getButtonIcon()}</span>
      <span className={styles.text}>
        {getButtonText()}
      </span>
    </button>
  );
}