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

    // Character limit removed. We will prefer single-file synthesis with a streaming fallback.

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
    
    // Prefer single-file synthesis; fallback to streaming/chunked if needed
    let base64Audio: string;
    try {
      await tts.synthesize(text, voice, {
        rate: formatRate(rate),
        pitch: formatPitch(pitch),
      });
      base64Audio = tts.toBase64();
    } catch (singleErr) {
      const collectStream = async (input: string) => {
        const buffers: Buffer[] = [];
        // @ts-ignore synthesizeStream may be available at runtime
        for await (const chunk of (tts as any).synthesizeStream(input, voice, {
          rate: formatRate(rate),
          pitch: formatPitch(pitch),
        })) {
          buffers.push(Buffer.isBuffer(chunk) ? (chunk as Buffer) : Buffer.from(chunk as any));
        }
        return Buffer.concat(buffers);
      };

      const splitIntoChunks = (input: string, maxLen = 4000) => {
        const parts: string[] = [];
        let remaining = input;
        while (remaining.length > maxLen) {
          let idx = Math.max(
            remaining.lastIndexOf('. ', maxLen),
            remaining.lastIndexOf('! ', maxLen),
            remaining.lastIndexOf('? ', maxLen),
            remaining.lastIndexOf('\n', maxLen)
          );
          if (idx < 0 || idx < Math.floor(maxLen * 0.5)) idx = maxLen;
          parts.push(remaining.slice(0, idx + 1));
          remaining = remaining.slice(idx + 1);
        }
        if (remaining.trim()) parts.push(remaining);
        return parts;
      };

      try {
        const buf = await collectStream(text);
        base64Audio = buf.toString('base64');
      } catch (streamErr) {
        const parts = splitIntoChunks(text);
        const allBuffers: Buffer[] = [];
        for (const part of parts) {
          const partBuf = await collectStream(part);
          allBuffers.push(partBuf);
        }
        base64Audio = Buffer.concat(allBuffers).toString('base64');
      }
    }
    
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
