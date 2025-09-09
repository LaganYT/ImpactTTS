'use client';

import { useState, useRef } from 'react';

interface Voice {
  ShortName: string;
  Gender: string;
  Locale: string;
  FriendlyName: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
  const [rate, setRate] = useState('0%');
  const [pitch, setPitch] = useState('0');
  const audioRef = useRef<HTMLAudioElement>(null);
  const previewRef = useRef<HTMLAudioElement>(null);

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteChars = atob(base64);
    const chunkSize = 1024;
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < byteChars.length; i += chunkSize) {
      const slice = byteChars.slice(i, i + chunkSize);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      chunks.push(new Uint8Array(byteNumbers));
    }
    return new Blob(chunks, { type: mimeType });
  };

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/tts');
      const data = await response.json();
      if (data.voices) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to load voices:', error);
    }
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          rate,
          pitch: parseInt(pitch),
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Create audio URL from base64 data
      const audioBlob = base64ToBlob(data.audio, data.mimeType);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const previewVoice = async () => {
    try {
      const params = new URLSearchParams({
        voice: selectedVoice,
        rate,
        pitch: String(parseInt(pitch)),
        text: 'This is a preview of the selected voice.'
      });
      const res = await fetch(`/api/tts/preview?${params.toString()}`);
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      const blob = base64ToBlob(data.audio, data.mimeType);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setTimeout(() => previewRef.current?.play(), 50);
    } catch (e) {
      console.error('Preview error', e);
      alert('Failed to generate preview');
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `speech-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">
          Edge TTS Text-to-Speech
        </h1>
      </div>
      
      <div className="card">
        <div className="form-group">
          <label htmlFor="text" className="label">
            Enter text to convert to speech:
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="textarea"
          />
        </div>

        <div className="grid grid-cols-1 grid-cols-3">
          <div className="form-group">
            <label htmlFor="voice" className="label">
              Voice:
            </label>
            <select
              id="voice"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="select"
              onFocus={loadVoices}
            >
              <option value="en-US-AriaNeural">Aria (US Female)</option>
              <option value="en-US-DavisNeural">Davis (US Male)</option>
              <option value="en-US-JennyNeural">Jenny (US Female)</option>
              <option value="en-US-GuyNeural">Guy (US Male)</option>
              <option value="en-GB-SoniaNeural">Sonia (UK Female)</option>
              <option value="en-GB-RyanNeural">Ryan (UK Male)</option>
              {voices.map((voice) => (
                <option key={voice.ShortName} value={voice.ShortName}>
                  {voice.FriendlyName} ({voice.Locale})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rate" className="label">
              Speech Rate: {rate}
            </label>
            <input
              type="range"
              id="rate"
              min="-50%"
              max="200%"
              step="10%"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="range"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pitch" className="label">
              Pitch: {pitch}Hz
            </label>
            <input
              type="range"
              id="pitch"
              min="-50"
              max="50"
              step="5"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              className="range"
            />
          </div>
        </div>

        <div className="actions">
          <button
            onClick={previewVoice}
            className="btn btn-secondary"
          >
            Preview Voice
          </button>
          <button
            onClick={generateSpeech}
            disabled={isLoading || !text.trim()}
            className="btn btn-primary"
          >
            {isLoading ? 'Generating Speech...' : 'Generate Full Speech'}
          </button>
        </div>
      </div>

      {previewUrl && (
        <div className="audio-section">
          <h2 className="audio-title">Voice Preview</h2>
          <audio ref={previewRef} src={previewUrl} controls className="audio-player" />
        </div>
      )}

      {audioUrl && (
        <div className="audio-section">
          <h2 className="audio-title">Generated Audio</h2>
          
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            className="audio-player"
          />
          
          <div className="btn-group">
            <button
              onClick={playAudio}
              className="btn btn-success"
            >
              Play
            </button>
            <button
              onClick={pauseAudio}
              className="btn btn-warning"
            >
              Pause
            </button>
            <button
              onClick={downloadAudio}
              className="btn btn-purple"
            >
              Download Audio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
