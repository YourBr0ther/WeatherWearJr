'use client';

import { ClothingRecommendation as ClothingRec } from '@/lib/clothing';
import styles from './ClothingRecommendation.module.css';

interface ClothingRecommendationProps {
  recommendation: ClothingRec;
}

export default function ClothingRecommendation({ recommendation }: ClothingRecommendationProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>What to Wear Today</h2>
      <div className={styles.items}>
        {recommendation.items.map((item, index) => (
          <div key={index} className={styles.item}>
            <div className={styles.icon}>{item.icon}</div>
            <div className={styles.name}>{item.name}</div>
          </div>
        ))}
      </div>
      <div className={styles.advice}>
        {recommendation.advice}
      </div>
    </div>
  );
}