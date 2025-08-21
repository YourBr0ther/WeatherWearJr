import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// In-memory storage for daily facts (in production, you'd use a database)
let dailyFactCache: { 
  date: string; 
  fact: string; 
  audioGenerated: boolean; 
} | null = null;

const kidFriendlyFactPrompts = [
  "Tell me an amazing fact about animals that will make a 5-year-old say 'wow!'",
  "Share a cool fact about space that a 5-year-old can understand and find exciting",
  "Give me a fun fact about dinosaurs that will fascinate a 5-year-old",
  "Tell me something incredible about the ocean that a 5-year-old would love to know",
  "Share an awesome fact about how things work that a 5-year-old can understand",
  "Give me a magical fact about nature that will amaze a 5-year-old",
  "Tell me a super cool fact about the human body that a 5-year-old would find amazing",
  "Share a fun fact about food that a 5-year-old would think is awesome",
  "Give me an exciting fact about weather that a 5-year-old can understand",
  "Tell me something amazing about insects that will wow a 5-year-old",
  "Share a cool fact about birds that a 5-year-old would love",
  "Give me a fun fact about colors that a 5-year-old would find interesting",
  "Tell me something awesome about plants that a 5-year-old can understand",
  "Share an amazing fact about transportation that would excite a 5-year-old"
];

export async function GET() {
  try {
    const today = new Date().toDateString();
    
    // If we have a fact for today, return it
    if (dailyFactCache && dailyFactCache.date === today) {
      return NextResponse.json({ 
        fact: dailyFactCache.fact,
        isNew: false 
      });
    }

    // Generate a new fact for today
    if (!process.env.OPENAI_API_KEY) {
      // Fallback facts if OpenAI isn't available
      const fallbackFacts = [
        "WOW! Butterflies taste with their feet! They land on flowers and taste them to see if they're super yummy!",
        "AMAZING! A group of flamingos is called a 'flamboyance' - that's the most fun word ever!",
        "INCREDIBLE! Dolphins have special names for each other - they make magical sounds to call their best friends!",
        "SO COOL! Penguins slide on their bellies to zoom super fast on ice - it's like the best sledding ever!",
        "GUESS WHAT! Elephants can't jump, but they're incredible swimmers who love splashing in the water!",
        "WOW! Giraffes only sleep 2 tiny hours a day - they take super quick power naps while standing up!",
        "AMAZING! Octopuses have THREE hearts and bright blue blood - they're like awesome sea aliens!",
        "INCREDIBLE! Honey never ever goes bad - you could eat 1000-year-old honey and it would still be delicious!"
      ];
      
      const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      
      dailyFactCache = {
        date: today,
        fact: randomFact,
        audioGenerated: false
      };
      
      return NextResponse.json({ 
        fact: randomFact,
        isNew: true 
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Pick a random fact category
    const randomPrompt = kidFriendlyFactPrompts[Math.floor(Math.random() * kidFriendlyFactPrompts.length)];
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a super excited, happy teacher talking to a 5-year-old! Keep facts to 1-2 sentences maximum. Use simple words, lots of excitement, and wonder! Start with words like 'WOW!', 'AMAZING!', 'INCREDIBLE!', 'SO COOL!', or 'GUESS WHAT!' to make it sound really exciting! Use exclamation points and make it sound like the most awesome thing ever! Make it something that will make them gasp and want to tell everyone!"
        },
        {
          role: "user",
          content: randomPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const fact = completion.choices[0]?.message?.content?.trim() || "WOW! You're absolutely amazing and learning new things every day makes you even MORE incredible!";

    // Cache the fact for today
    dailyFactCache = {
      date: today,
      fact: fact,
      audioGenerated: false
    };

    return NextResponse.json({ 
      fact: fact,
      isNew: true 
    });

  } catch (error) {
    console.error('Fact generation error:', error);
    
    // Return a backup fact
    const backupFact = "WOW! You have the most amazing super brain that can learn new things every single day! You're absolutely incredible!";
    
    return NextResponse.json({ 
      fact: backupFact,
      isNew: true 
    });
  }
}