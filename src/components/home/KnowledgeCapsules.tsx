import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, BookOpen, Headphones, Gamepad2, ArrowRight } from 'lucide-react';

interface KnowledgeCapsulesProps {
  onPlay2048?: () => void;
  onPlayChess?: () => void;
}

export const KnowledgeCapsules: React.FC<KnowledgeCapsulesProps> = ({
  onPlay2048,
  onPlayChess,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSpeakGerman = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Fernweh');
      utterance.lang = 'de-DE';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section aria-label="Curator's Knowledge Bento" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Curator's Spotlight & Micro-Bites</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Bite-sized daily wisdom, language vocabulary, and on-demand audio knowledge.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: German Word of the Day */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                <BookOpen className="w-3 h-3 text-amber-600" />
                <span>Wort des Tages • German</span>
              </span>

              <button
                type="button"
                onClick={handleSpeakGerman}
                className="p-1.5 rounded-full bg-white text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 shadow-xs transition-all cursor-pointer"
                title="Listen to German pronunciation"
                aria-label="Listen to German pronunciation"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-amber-600' : ''}`} />
              </button>
            </div>

            <div className="mt-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fernweh</h3>
                <span className="text-xs font-mono text-slate-500">[ˈfɛʁnveː]</span>
              </div>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">noun, neuter</p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
              An ache for distant places; a deep yearning to travel and explore far-off countries — the opposite of homesickness (<em>Heimweh</em>).
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-amber-200/60">
            <Link
              to="/category/learn-german"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
            >
              <span>Explore German A1 Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Interactive Brain Lounge Quick-Play */}
        <div className="bg-gradient-to-br from-purple-500/10 via-purple-50/50 to-white rounded-3xl p-5 sm:p-6 border border-purple-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                <Gamepad2 className="w-3 h-3 text-purple-600" />
                <span>Brain Workout • Mini-Games</span>
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                Free & Saved
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
              2048 & Tactical Chess Arena
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Sharpen your analytical focus with on-device tactical challenges. High scores and win streaks are saved to your account.
            </p>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={onPlay2048}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Play 2048
              </button>
              <button
                type="button"
                onClick={onPlayChess}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                Play Chess AI
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-purple-200/60">
            <Link
              to="/category/entertainment-games"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 hover:text-purple-950 transition-colors"
            >
              <span>Visit Games Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Audio Listening Mode */}
        <div className="bg-gradient-to-br from-red-500/10 via-red-50/40 to-white rounded-3xl p-5 sm:p-6 border border-red-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                <Headphones className="w-3 h-3 text-red-600" />
                <span>Audio Edition</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-red-700 bg-white px-2 py-0.5 rounded-full border border-red-200">
                TTS
              </span>
            </div>

            <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
              Listen to Every Article on the Go
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Commuting or multitasking? Tap "Listen to this article" on any story for natural speech narration with variable speeds and paragraph scrubbing.
            </p>

            <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-xl border border-red-100">
              <div className="flex items-center gap-0.5 text-red-600">
                <span className="w-1 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-red-400 rounded-full animate-pulse delay-150" />
                <span className="w-1 h-4 bg-red-600 rounded-full animate-pulse delay-100" />
              </div>
              <span className="truncate">Natural speech with play/pause controls</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-red-200/60">
            <Link
              to="/category/travel"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-800 hover:text-red-950 transition-colors"
            >
              <span>Explore Audio Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeCapsules;
