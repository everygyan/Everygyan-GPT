import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import {
  segmentArticleText,
  formatAudioTime,
  SpeechSegmentation,
} from '../../utils/textToSpeech';

interface ArticleAudioPlayerProps {
  article: {
    title: string;
    excerpt?: string;
    content: string;
    read_time?: string;
    audio_url?: string;
  };
}

const PLAYBACK_RATES = [0.75, 1.0, 1.25, 1.5, 2.0];

export const ArticleAudioPlayer: React.FC<ArticleAudioPlayerProps> = ({ article }) => {
  // Check browser SpeechSynthesis capability
  const isSpeechSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // Segment article into clean spoken chunks
  const segmentation: SpeechSegmentation = useMemo(() => {
    return segmentArticleText({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
    });
  }, [article.title, article.excerpt, article.content]);

  // Audio & Speech States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isScrolledPast, setIsScrolledPast] = useState<boolean>(false);
  const [nativeAudioDuration, setNativeAudioDuration] = useState<number>(0);

  // References
  const inlineContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const currentChunkIndexRef = useRef<number>(0);
  currentChunkIndexRef.current = currentChunkIndex;

  const totalDuration = article.audio_url
    ? nativeAudioDuration || 60
    : segmentation.estimatedDurationSeconds;

  // Load available system TTS voices
  useEffect(() => {
    if (!isSpeechSupported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Filter for English or language match, prioritizing natural voices
      const filtered = voices.filter(
        (v) => v.lang.startsWith('en') || v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')
      );

      const usable = filtered.length > 0 ? filtered : voices;
      setAvailableVoices(usable);

      // Restore saved voice or pick best default
      try {
        const saved = localStorage.getItem('everygyan_tts_voice');
        if (saved && usable.some((v) => v.voiceURI === saved)) {
          setSelectedVoiceURI(saved);
          return;
        }
      } catch {
        // ignore
      }

      const best =
        usable.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')) ||
        usable[0];
      if (best) {
        setSelectedVoiceURI(best.voiceURI);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSpeechSupported]);

  // Track scroll position to show floating sticky mini-player
  useEffect(() => {
    const handleScroll = () => {
      if (!inlineContainerRef.current) return;
      const rect = inlineContainerRef.current.getBoundingClientRect();
      // True when user has scrolled past bottom of inline card
      setIsScrolledPast(rect.bottom < 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup on unmount or article change
  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isSpeechSupported, article.title]);

  // Timer loop for time elapsed
  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          if (article.audio_url && audioRef.current) {
            return Math.floor(audioRef.current.currentTime);
          }
          if (prev + 1 >= totalDuration) {
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, isPaused, playbackRate, totalDuration, article.audio_url]);

  // Speak a specific chunk index using SpeechSynthesis
  const speakChunk = useCallback(
    (index: number) => {
      if (!isSpeechSupported) return;
      if (index >= segmentation.chunks.length) {
        // Finished narration
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
        setElapsedSeconds(totalDuration);
        isSpeakingRef.current = false;
        return;
      }

      window.speechSynthesis.cancel();

      const text = segmentation.chunks[index];
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.rate = playbackRate;
      utterance.volume = isMuted ? 0 : 1;

      if (selectedVoiceURI) {
        const foundVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI);
        if (foundVoice) utterance.voice = foundVoice;
      }

      utterance.onend = () => {
        if (!isSpeakingRef.current) return;
        const nextIdx = index + 1;
        setCurrentChunkIndex(nextIdx);
        // Calculate proportional elapsed time
        const ratio = nextIdx / segmentation.chunks.length;
        setElapsedSeconds(Math.floor(ratio * totalDuration));
        speakChunk(nextIdx);
      };

      utterance.onerror = (e) => {
        // If canceled on purpose, ignore
        if (e.error === 'canceled' || e.error === 'interrupted') return;
        console.warn('[ArticleAudioPlayer] TTS utterance error:', e.error);
        setIsPlaying(false);
        setIsPaused(false);
        isSpeakingRef.current = false;
      };

      setCurrentChunkIndex(index);
      isSpeakingRef.current = true;
      window.speechSynthesis.speak(utterance);
    },
    [
      isSpeechSupported,
      segmentation.chunks,
      playbackRate,
      isMuted,
      selectedVoiceURI,
      availableVoices,
      totalDuration,
    ]
  );

  // Play / Resume
  const handlePlay = () => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    if (!isSpeechSupported) return;

    if (isPaused) {
      // Resume existing utterance
      window.speechSynthesis.resume();
      isSpeakingRef.current = true;
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      // Start or restart from currentChunkIndex
      setIsPlaying(true);
      setIsPaused(false);
      speakChunk(currentChunkIndex);
    }
  };

  // Pause
  const handlePause = () => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    if (!isSpeechSupported) return;
    window.speechSynthesis.pause();
    isSpeakingRef.current = false;
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Stop & Reset
  const handleStop = () => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
    setElapsedSeconds(0);
  };

  // Skip Forward 15 Seconds (or next chunk)
  const handleSkipForward = () => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.currentTime = Math.min(
        nativeAudioDuration,
        audioRef.current.currentTime + 15
      );
      setElapsedSeconds(Math.floor(audioRef.current.currentTime));
      return;
    }

    if (!isSpeechSupported || segmentation.chunks.length === 0) return;
    const step = Math.max(1, Math.round(segmentation.chunks.length * (15 / totalDuration)));
    const targetIdx = Math.min(segmentation.chunks.length - 1, currentChunkIndex + step);
    setCurrentChunkIndex(targetIdx);
    const newRatio = targetIdx / segmentation.chunks.length;
    setElapsedSeconds(Math.floor(newRatio * totalDuration));

    if (isPlaying && !isPaused) {
      speakChunk(targetIdx);
    }
  };

  // Skip Backward 15 Seconds (or previous chunk)
  const handleSkipBackward = () => {
    if (article.audio_url && audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      setElapsedSeconds(Math.floor(audioRef.current.currentTime));
      return;
    }

    if (!isSpeechSupported || segmentation.chunks.length === 0) return;
    const step = Math.max(1, Math.round(segmentation.chunks.length * (15 / totalDuration)));
    const targetIdx = Math.max(0, currentChunkIndex - step);
    setCurrentChunkIndex(targetIdx);
    const newRatio = targetIdx / segmentation.chunks.length;
    setElapsedSeconds(Math.floor(newRatio * totalDuration));

    if (isPlaying && !isPaused) {
      speakChunk(targetIdx);
    }
  };

  // Seek bar scrubber click
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value);
    const targetSec = (percent / 100) * totalDuration;
    setElapsedSeconds(Math.floor(targetSec));

    if (article.audio_url && audioRef.current) {
      audioRef.current.currentTime = targetSec;
      return;
    }

    if (segmentation.chunks.length > 0) {
      const targetChunk = Math.min(
        segmentation.chunks.length - 1,
        Math.floor((percent / 100) * segmentation.chunks.length)
      );
      setCurrentChunkIndex(targetChunk);
      if (isPlaying && !isPaused) {
        speakChunk(targetChunk);
      }
    }
  };

  // Playback Speed Toggle
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (article.audio_url && audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    // If speaking via TTS, re-speak current chunk with new rate
    if (isPlaying && !isPaused && !article.audio_url) {
      speakChunk(currentChunkIndex);
    }
  };

  // Voice Selection
  const handleVoiceSelect = (voiceURI: string) => {
    setSelectedVoiceURI(voiceURI);
    try {
      localStorage.setItem('everygyan_tts_voice', voiceURI);
    } catch {
      // ignore
    }
    if (isPlaying && !isPaused && !article.audio_url) {
      speakChunk(currentChunkIndex);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (article.audio_url && audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Calculate current progress percent
  const progressPercent =
    totalDuration > 0 ? Math.min(100, (elapsedSeconds / totalDuration) * 100) : 0;

  // If SpeechSynthesis is completely unsupported and no audio_url, gracefully hide
  if (!isSpeechSupported && !article.audio_url) {
    return null;
  }

  return (
    <>
      {/* Hidden Native Audio Element (if article provides audio_url) */}
      {article.audio_url && (
        <audio
          ref={audioRef}
          src={article.audio_url}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setNativeAudioDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsPaused(false);
            setElapsedSeconds(nativeAudioDuration);
          }}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setElapsedSeconds(Math.floor(audioRef.current.currentTime));
            }
          }}
        />
      )}

      {/* ========================================================= */}
      {/* 1. Main Inline Audio Player Card                          */}
      {/* ========================================================= */}
      <div
        ref={inlineContainerRef}
        className="relative overflow-hidden bg-gradient-to-br from-red-50/70 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-red-200/60 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm text-slate-800 dark:text-slate-100 mb-8 transition-all"
        role="region"
        aria-label="Audio player for listening to article"
      >
        {/* Subtle ambient decorative element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header row: Status, Narrator badge & Settings toggle */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Listen to this article
                  </span>
                  {isPlaying && !isPaused && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800 animate-pulse">
                      Playing
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {article.audio_url
                    ? 'Original Audio Narration'
                    : 'EveryGyan Voice Narrator • Natural speech'}
                </p>
              </div>
            </div>

            {/* Right actions: Speed & Settings */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Playback Speed Pill */}
              <button
                type="button"
                onClick={() => {
                  const currIdx = PLAYBACK_RATES.indexOf(playbackRate);
                  const nextIdx = (currIdx + 1) % PLAYBACK_RATES.length;
                  handleSpeedChange(PLAYBACK_RATES[nextIdx]);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-400 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                title="Change Playback Speed"
              >
                {playbackRate}x
              </button>

              {/* Mute Button */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Settings Dropdown Button (available for TTS voices) */}
              {availableVoices.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    showSettings
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                  title="Voice & Speech Settings"
                  aria-label="Voice settings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Settings Panel (Accordion) */}
          {showSettings && (
            <div className="p-3.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Voice Narration Options
                </span>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Select Narrator Voice ({availableVoices.length} available)
                </label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => handleVoiceSelect(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Playback Speed
                </span>
                <div className="flex gap-1.5">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`flex-1 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 ${
                        playbackRate === rate
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {rate}x {playbackRate === rate && <Check className="w-2.5 h-2.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress Scrubber Bar */}
          <div className="space-y-1.5">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={progressPercent}
                onChange={handleScrubberChange}
                aria-label="Audio scrubber"
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
              />
            </div>

            {/* Time stamps */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>{formatAudioTime(elapsedSeconds)}</span>
              <span>{formatAudioTime(totalDuration)}</span>
            </div>
          </div>

          {/* Player Controls Center Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Animated Equalizer Visualizer */}
            <div className="flex items-center gap-1 w-16">
              {isPlaying && !isPaused ? (
                <>
                  <span className="w-1 h-4 bg-red-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-6 bg-red-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-3 bg-red-600 rounded-full animate-bounce [animation-delay:-0.45s]" />
                  <span className="w-1 h-5 bg-red-600 rounded-full animate-bounce" />
                </>
              ) : (
                <div className="flex items-center gap-1 opacity-40">
                  <span className="w-1 h-2 bg-slate-400 rounded-full" />
                  <span className="w-1 h-2 bg-slate-400 rounded-full" />
                  <span className="w-1 h-2 bg-slate-400 rounded-full" />
                  <span className="w-1 h-2 bg-slate-400 rounded-full" />
                </div>
              )}
            </div>

            {/* Core Play / Skip Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Skip Back 15s */}
              <button
                type="button"
                onClick={handleSkipBackward}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all"
                title="Rewind 15 seconds"
                aria-label="Rewind 15 seconds"
              >
                <div className="relative">
                  <RotateCcw className="w-5 h-5" />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                    15
                  </span>
                </div>
              </button>

              {/* Main Play / Pause Button */}
              {isPlaying && !isPaused ? (
                <button
                  type="button"
                  onClick={handlePause}
                  className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 transition-all"
                  title="Pause Audio"
                  aria-label="Pause"
                >
                  <Pause className="w-5 h-5 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 active:scale-95 transition-all pl-0.5"
                  title="Play Audio"
                  aria-label="Play"
                >
                  <Play className="w-5 h-5 fill-white" />
                </button>
              )}

              {/* Skip Forward 15s */}
              <button
                type="button"
                onClick={handleSkipForward}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 active:scale-95 transition-all"
                title="Skip forward 15 seconds"
                aria-label="Skip forward 15 seconds"
              >
                <div className="relative">
                  <RotateCw className="w-5 h-5" />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">
                    15
                  </span>
                </div>
              </button>
            </div>

            {/* Current paragraph indicator or Stop button */}
            <div className="w-16 flex justify-end">
              {(isPlaying || isPaused) && (
                <button
                  type="button"
                  onClick={handleStop}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Floating Sticky Mini-Player (When scrolled past)       */}
      {/* ========================================================= */}
      {isScrolledPast && (isPlaying || isPaused) && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94%] bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 px-4 shadow-2xl text-white flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200"
          role="region"
          aria-label="Floating audio player"
        >
          {/* Left: Play/Pause button + title */}
          <div className="flex items-center gap-3 min-w-0">
            {isPlaying && !isPaused ? (
              <button
                type="button"
                onClick={handlePause}
                className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/30 transition-all"
                aria-label="Pause"
              >
                <Pause className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/30 transition-all pl-0.5"
                aria-label="Play"
              >
                <Play className="w-4 h-4 fill-white" />
              </button>
            )}

            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                {article.title}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {formatAudioTime(elapsedSeconds)} / {formatAudioTime(totalDuration)} • {playbackRate}x
              </p>
            </div>
          </div>

          {/* Center/Right: Quick Seek & Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipBackward}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Rewind 15s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSkipForward}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Forward 15s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Speed Toggle */}
            <button
              type="button"
              onClick={() => {
                const currIdx = PLAYBACK_RATES.indexOf(playbackRate);
                const nextIdx = (currIdx + 1) % PLAYBACK_RATES.length;
                handleSpeedChange(PLAYBACK_RATES[nextIdx]);
              }}
              className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
            >
              {playbackRate}x
            </button>

            {/* Close / Stop */}
            <button
              type="button"
              onClick={handleStop}
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors ml-1"
              title="Stop Audio"
              aria-label="Stop audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
