export interface ClothingItem {
  icon: string;
  name: string;
}

export interface ClothingRecommendation {
  items: ClothingItem[];
  advice: string;
}

export function getClothingRecommendation(
  currentTemp: number,
  highTemp: number,
  lowTemp: number
): ClothingRecommendation {
  const tempVariation = highTemp - lowTemp;
  const isLargeVariation = tempVariation > 15;

  // Hot weather (≥75°F)
  if (currentTemp >= 75) {
    return {
      items: [
        { icon: '👕', name: 'T-shirt' },
        { icon: '🩳', name: 'Shorts' },
        { icon: '👟', name: 'Sneakers' },
        { icon: '🧴', name: 'Sunscreen' }
      ],
      advice: isLargeVariation 
        ? "It's hot but might cool down later! Bring a light jacket just in case."
        : "It's a hot day! Wear light clothes and stay cool!"
    };
  }

  // Mild weather (60-74°F)
  if (currentTemp >= 60) {
    return {
      items: [
        { icon: '👔', name: 'Long sleeve shirt' },
        { icon: '👖', name: 'Pants' },
        { icon: '🧥', name: 'Light jacket' },
        { icon: '👟', name: 'Sneakers' }
      ],
      advice: isLargeVariation
        ? "The weather changes today! Layer up so you can adjust."
        : "Nice weather! A light jacket will keep you comfy."
    };
  }

  // Cool weather (40-59°F)
  if (currentTemp >= 40) {
    return {
      items: [
        { icon: '🧥', name: 'Warm jacket' },
        { icon: '👖', name: 'Long pants' },
        { icon: '🧣', name: 'Scarf' },
        { icon: '👢', name: 'Boots' }
      ],
      advice: isLargeVariation
        ? "It's chilly and changing! Dress in layers to stay warm."
        : "It's cool outside! Your jacket will keep you warm."
    };
  }

  // Cold weather (<40°F)
  return {
    items: [
      { icon: '🧥', name: 'Winter coat' },
      { icon: '🧤', name: 'Gloves' },
      { icon: '🧣', name: 'Warm scarf' },
      { icon: '👢', name: 'Winter boots' }
    ],
    advice: isLargeVariation
      ? "Brrr! It's cold and changing! Bundle up in warm layers!"
      : "It's very cold! Bundle up to stay warm and cozy!"
  };
}