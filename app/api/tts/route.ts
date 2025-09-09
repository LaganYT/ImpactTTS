import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from '@andresaya/edge-tts';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'en-US-AriaNeural', rate = '0%', pitch = 0 } = await request.json();

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
    
    // Convert pitch number to proper format
    const formatPitch = (pitchNum: number) => {
      if (pitchNum === 0) return '0Hz';
      return pitchNum > 0 ? `+${pitchNum}Hz` : `${pitchNum}Hz`;
    };

    const formatRate = (rateStr: string) => {
      const num = parseInt(rateStr.replace('%', ''));
      if (num === 0) return '0%';
      return num > 0 ? `+${num}%` : `${num}%`;
    };
    
    // Generate audio using the correct API with properly formatted parameters
    await tts.synthesize(text, voice, {
      rate: formatRate(rate),
      pitch: formatPitch(pitch),
    });

    // Get the audio as base64
    const base64Audio = tts.toBase64();
    
    return NextResponse.json({
      audio: base64Audio,
      mimeType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('TTS Error:', error);
    let errorMessage = 'Failed to generate speech';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json(
      { error: errorMessage },
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
