import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { fact } = await request.json();

    if (!fact) {
      return NextResponse.json(
        { error: 'Fact text is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Add excitement and energy to the message
    const fullMessage = `${fact} Come back tomorrow for another super cool fact!`;

    // Generate TTS optimized for excited, happy fact delivery to kids
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // More energetic and expressive voice, great for kids!
      input: fullMessage,
      speed: 1.0, // Normal speed with more energy and enthusiasm
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Fact TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate fact speech' },
      { status: 500 }
    );
  }
}