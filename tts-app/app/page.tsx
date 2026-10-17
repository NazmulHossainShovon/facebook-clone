'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  Sparkles, 
  Loader2, 
  RotateCcw, 
  Sliders, 
  Code, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

export default function Home() {
  const defaultText = "Movies, oh my gosh, I just just absolutely love them. They're like time machines taking you to different worlds and landscapes, and um, and I just can't get enough of it.";
  const defaultPrompt = "Read aloud in a warm, welcoming tone.";

  const [text, setText] = useState(defaultText);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [languageCode, setLanguageCode] = useState("bn-bd");
  const [voiceName, setVoiceName] = useState("Zubenelgenubi");
  const [modelName, setModelName] = useState("gemini-3.1-flash-tts-preview");
  const [audioEncoding, setAudioEncoding] = useState("LINEAR16");
  const [pitch, setPitch] = useState(0);
  const [speakingRate, setSpeakingRate] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  interface SynthesizeResult {
    audioContent: string;
    mp3Content: string;
    audioEncoding: string;
    requestPayload: Record<string, unknown>;
    stats: {
      rawSize: number;
      mp3Size: number;
    };
  }

  const [result, setResult] = useState<SynthesizeResult | null>(null);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  useEffect(() => {
    if (result?.mp3Content) {
      const src = `data:audio/mp3;base64,${result.mp3Content}`;
      setAudioSrc(src);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [result]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleDownloadMp3 = () => {
    if (!result?.mp3Content) return;
    const link = document.createElement('a');
    link.href = `data:audio/mp3;base64,${result.mp3Content}`;
    link.download = `synthesized-speech-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text to synthesize.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioConfig: {
            audioEncoding,
            pitch: Number(pitch),
            speakingRate: Number(speakingRate),
          },
          input: {
            prompt,
            text,
          },
          voice: {
            languageCode,
            modelName,
            name: voiceName,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to synthesize speech');
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const currentPayloadPreview = {
    audioConfig: {
      audioEncoding,
      pitch: Number(pitch),
      speakingRate: Number(speakingRate),
    },
    input: {
      prompt,
      text,
    },
    voice: {
      languageCode,
      modelName,
      name: voiceName,
    },
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(currentPayloadPreview, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
      </div>

      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Google Cloud Text-to-Speech
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Gemini TTS Preview
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Model: <span className="font-mono text-slate-300">gemini-3.1-flash-tts-preview</span> | Voice: <span className="font-mono text-slate-300">Zubenelgenubi</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              ADC Connected
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Main form card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="inputText" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span>Input Text</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({text.length} characters)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setText(defaultText)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset to default
                </button>
              </div>

              <textarea
                id="inputText"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to synthesize into speech..."
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y shadow-inner"
              />
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Voice & Audio Options'}
              </button>

              <button
                type="button"
                onClick={() => setShowJson(!showJson)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800/80 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-slate-400" />
                {showJson ? 'Hide Payload' : 'View Request JSON'}
              </button>
            </div>

            {/* Collapsible Advanced Settings */}
            {showAdvanced && (
              <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-5 animate-in fade-in duration-200">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Voice & Synthesis Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Prompt (Tone & Style Instruction)
                    </label>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Voice Name
                    </label>
                    <input
                      type="text"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Language Code
                    </label>
                    <input
                      type="text"
                      value={languageCode}
                      onChange={(e) => setLanguageCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Audio Encoding
                    </label>
                    <select
                      value={audioEncoding}
                      onChange={(e) => setAudioEncoding(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="LINEAR16">LINEAR16 (WAV ➔ Converted to MP3)</option>
                      <option value="MP3">MP3 (Native Direct Encoding)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Pitch ({pitch})
                      </label>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Rate ({speakingRate}x)
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speakingRate}
                        onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible JSON Preview */}
            {showJson && (
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 relative font-mono text-xs text-slate-300 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-semibold">POST https://texttospeech.googleapis.com/v1beta1/text:synthesize</span>
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto p-2 bg-slate-900/90 rounded border border-slate-800/80 text-indigo-300">
                  {JSON.stringify(currentPayloadPreview, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-200">Synthesis Request Failed</h4>
                  <p className="text-xs text-red-300/90 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:via-purple-500 hover:to-indigo-500 text-white font-medium text-sm md:text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing with Gemini TTS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Synthesize Speech</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Audio Player & Download Card */}
        {result && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-semibold text-white">Audio Synthesized Successfully</h2>
                  <p className="text-xs text-slate-400">
                    Format: <span className="text-slate-300 font-mono">MP3 (MPEG Layer 3)</span> • Size: <span className="text-slate-300 font-mono">{(result.stats.mp3Size / 1024).toFixed(1)} KB</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadMp3}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download MP3</span>
              </button>
            </div>

            {/* Custom Audio Player UI */}
            <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-4">
              <audio
                ref={audioRef}
                src={audioSrc || undefined}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
              />

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.01"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Statistics / Technical summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <div className="text-slate-400">Requested Encoding</div>
                <div className="font-mono text-slate-200 font-semibold mt-0.5">{result.audioEncoding}</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <div className="text-slate-400">Converted Output</div>
                <div className="font-mono text-emerald-400 font-semibold mt-0.5">MP3 (128 kbps)</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <div className="text-slate-400">Google WAV Size</div>
                <div className="font-mono text-slate-200 font-semibold mt-0.5">{(result.stats.rawSize / 1024).toFixed(1)} KB</div>
              </div>
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <div className="text-slate-400">MP3 Size</div>
                <div className="font-mono text-emerald-400 font-semibold mt-0.5">{(result.stats.mp3Size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
          </div>
        )}

        {/* Credentials & Environment Setup Guide */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 text-sm text-slate-300 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <h3>Google Cloud Application Default Credentials (ADC)</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The app uses server-side OAuth2 authentication to request tokens for Google Cloud Text-to-Speech endpoint. 
            For local execution or production deployment (Vercel, Docker, etc.), provide these environment variables in <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.env.local</code>:
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>
{`GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLIENT_ID=your-oauth2-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-oauth2-client-secret
GOOGLE_REFRESH_TOKEN=your-oauth2-refresh-token`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
