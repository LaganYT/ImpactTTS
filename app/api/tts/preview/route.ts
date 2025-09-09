import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from '@andresaya/edge-tts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const voice = searchParams.get('voice') || 'en-US-AriaNeural';
    const rate = searchParams.get('rate') || '0%';
    const pitchParam = searchParams.get('pitch');
    const pitch = pitchParam ? Number(pitchParam) : 0;

    const previewText = searchParams.get('text') || 'This is a preview of the selected voice.';

    const tts = new EdgeTTS();

    const formatPitch = (pitchNum: number) => {
      if (Number.isNaN(pitchNum) || pitchNum === 0) return '0Hz';
      return pitchNum > 0 ? `+${pitchNum}Hz` : `${pitchNum}Hz`;
    };

    const formatRate = (rateStr: string) => {
      const num = parseInt(rateStr.replace('%', ''));
      if (Number.isNaN(num) || num === 0) return '0%';
      return num > 0 ? `+${num}%` : `${num}%`;
    };

    await tts.synthesize(previewText, voice, {
      rate: formatRate(rate),
      pitch: formatPitch(pitch),
    });

    const base64Audio = tts.toBase64();
    return NextResponse.json({ audio: base64Audio, mimeType: 'audio/mpeg' });
  } catch (error) {
    console.error('Preview TTS Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to generate preview: ${message}` }, { status: 500 });
  }
}


