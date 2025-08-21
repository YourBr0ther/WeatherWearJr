# OpenAI Voice Integration Guide

## Overview

The app now uses OpenAI's high-quality text-to-speech API for a much better voice experience for kids, with automatic fallback to the browser's built-in speech synthesis.

## Voice Options

The app is currently set to use the "nova" voice, which is great for kids. You can change this in `/app/api/speak/route.ts`:

### Available OpenAI Voices:
- **alloy** - Neutral, balanced voice
- **echo** - Warm, expressive voice  
- **fable** - British accent, storytelling style
- **nova** - Bright, engaging (current choice - great for kids!)
- **onyx** - Deep, authoritative voice
- **shimmer** - Soft, gentle voice

## Cost Considerations

OpenAI TTS pricing (as of 2024):
- **tts-1**: $15 per 1M characters (~$0.015 per 1000 characters)
- **tts-1-hd**: $30 per 1M characters (higher quality)

For a typical weather announcement (~200 characters), cost is approximately $0.003 per use.

## How It Works

1. **Primary**: Tries OpenAI TTS first for best quality
2. **Fallback**: If OpenAI fails/unavailable, uses browser's Web Speech API
3. **Loading State**: Shows "Generating Voice..." while creating audio
4. **Caching**: Audio files are created fresh each time (no caching for real-time weather)

## Setup Steps

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. The app will automatically use OpenAI if the key is present

## Benefits Over Browser TTS

- **Quality**: Much more natural sounding voices
- **Consistency**: Same voice across all browsers/devices  
- **Kid-Friendly**: Voices optimized for clear speech
- **Reliability**: Doesn't depend on OS/browser speech engines

## Customization

You can modify the voice parameters in `/app/api/speak/route.ts`:

```typescript
const mp3 = await openai.audio.speech.create({
  model: "tts-1", // or "tts-1-hd" for higher quality
  voice: "nova", // Change voice here
  input: text,
  speed: 0.9, // 0.25 to 4.0 (slower for kids)
});
```