'use client';

import { useState, useRef } from 'react';
import styles from './FactButton.module.css';

export default function FactButton() {
  const [fact, setFact] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasFactForToday, setHasFactForToday] = useState(false);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchFactAndSpeak = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/fact');
      const data = await response.json();
      
      setFact(data.fact);
      setHasFactForToday(true);
      
      // Immediately play the fact after getting it
      await playFactAudio(data.fact);
    } catch (error) {
      console.error('Error fetching fact:', error);
      const fallbackFact = "WOW! You're absolutely amazing and learning new things every day makes you even MORE incredible!";
      setFact(fallbackFact);
      setHasFactForToday(true);
      
      // Play the fallback fact
      await playFactAudio(fallbackFact);
    } finally {
      setIsLoading(false);
    }
  };

  const playFactAudio = async (factText: string) => {
    try {
      let audioUrl = cachedAudioUrl;
      
      // If we don't have cached audio, generate it
      if (!audioUrl) {
        const response = await fetch('/api/fact-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fact: factText }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        setCachedAudioUrl(audioUrl); // Cache for repeated use
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
      } else {
        audioRef.current = new Audio(audioUrl);
      }

      audioRef.current.onloadstart = () => setIsSpeaking(true);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        // Don't revoke URL anymore - we're caching it
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing fact:', error);
    }
  };

  const speakFact = async () => {
    if (!fact) return;
    setIsLoading(true);
    await playFactAudio(fact);
    setIsLoading(false);
  };

  const handleClick = async () => {
    if (!hasFactForToday) {
      await fetchFactAndSpeak();
    } else {
      await speakFact();
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading Amazing Fact...';
    if (isSpeaking) return 'Stop Fact';
    if (!hasFactForToday) return 'Learn Something Cool!';
    return 'Hear My Fact Again!';
  };

  const getButtonIcon = () => {
    if (isLoading) return '✨';
    if (isSpeaking) return '🔇';
    return '🧠';
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${isSpeaking ? styles.speaking : ''} ${isLoading ? styles.loading : ''}`}
        onClick={isSpeaking ? stopSpeaking : handleClick}
        disabled={isLoading}
        aria-label={isLoading ? 'Loading fact' : isSpeaking ? 'Stop speaking' : 'Get daily fact'}
      >
        <span className={styles.icon}>{getButtonIcon()}</span>
        <span className={styles.text}>
          {getButtonText()}
        </span>
      </button>
      
      {fact && !isSpeaking && (
        <div className={styles.factDisplay}>
          <p className={styles.factText}>{fact}</p>
          <p className={styles.comeBackText}>Come back tomorrow for another interesting fact!</p>
        </div>
      )}
    </div>
  );
}