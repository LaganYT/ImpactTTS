import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from '@andresaya/edge-tts';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'en-US-AriaNeural', rate = '0%', pitch = '0%' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Text must be 1000 characters or less' },
        { status: 400 }
      );
    }

    const tts = new EdgeTTS();
    
    // Generate audio using the correct API
    await tts.synthesize(text, voice, {
      rate: rate,
      pitch: pitch,
    });

    // Get the audio as base64
    const base64Audio = tts.toBase64();
    
    return NextResponse.json({
      audio: base64Audio,
      mimeType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tts = new EdgeTTS();
    const voices = await tts.getVoices();
    
    return NextResponse.json({ voices });
  } catch (error) {
    console.error('Voices Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}
