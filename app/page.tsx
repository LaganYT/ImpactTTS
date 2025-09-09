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
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('en-US-AriaNeural');
  const [rate, setRate] = useState('0%');
  const [pitch, setPitch] = useState('0%');
  const audioRef = useRef<HTMLAudioElement>(null);

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
          pitch,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Create audio URL from base64 data
      const audioBlob = new Blob([Buffer.from(data.audio, 'base64')], {
        type: data.mimeType,
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Failed to generate speech');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Edge TTS Text-to-Speech
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Enter text to convert to speech:
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your text here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 mt-1">
              {text.length}/1000 characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                Voice:
              </label>
              <select
                id="voice"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-2">
                Pitch: {pitch}
              </label>
              <input
                type="range"
                id="pitch"
                min="-50%"
                max="50%"
                step="10%"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={generateSpeech}
            disabled={isLoading || !text.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating Speech...' : 'Generate Speech'}
          </button>
        </div>

        {audioUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Generated Audio</h2>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full mb-4"
            />
            
            <div className="flex gap-4">
              <button
                onClick={playAudio}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Play
              </button>
              <button
                onClick={pauseAudio}
                className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={downloadAudio}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Download Audio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
