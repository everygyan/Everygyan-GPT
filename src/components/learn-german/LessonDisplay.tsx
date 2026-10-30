import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Shuffle,
  PenTool,
  Trophy,
} from 'lucide-react';
import { LevelLessonData, VocabItem, MatchingPair, FillBlankItem } from '../../data/germanLessons';

interface LessonDisplayProps {
  data: LevelLessonData;
}

export const LessonDisplay: React.FC<LessonDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'vocab' | 'matching' | 'fillBlank'>('vocab');

  // Matching state
  const [selectedGerman, setSelectedGerman] = useState<string | null>(null);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [matchingError, setMatchingError] = useState<string | null>(null);

  // Fill in the blank state
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [fillSubmitted, setFillSubmitted] = useState(false);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  // Matching click handlers
  const handleGermanClick = (pair: MatchingPair) => {
    if (matchedIds.includes(pair.id)) return;
    setMatchingError(null);
    setSelectedGerman(pair.id);

    if (selectedEnglish) {
      if (pair.id === selectedEnglish) {
        setMatchedIds((prev) => [...prev, pair.id]);
        setSelectedGerman(null);
        setSelectedEnglish(null);
      } else {
        setMatchingError('Not a match. Try again!');
        setTimeout(() => {
          setSelectedGerman(null);
          setSelectedEnglish(null);
          setMatchingError(null);
        }, 900);
      }
    }
  };

  const handleEnglishClick = (pair: MatchingPair) => {
    if (matchedIds.includes(pair.id)) return;
    setMatchingError(null);
    setSelectedEnglish(pair.id);

    if (selectedGerman) {
      if (pair.id === selectedGerman) {
        setMatchedIds((prev) => [...prev, pair.id]);
        setSelectedGerman(null);
        setSelectedEnglish(null);
      } else {
        setMatchingError('Not a match. Try again!');
        setTimeout(() => {
          setSelectedGerman(null);
          setSelectedEnglish(null);
          setMatchingError(null);
        }, 900);
      }
    }
  };

  const resetMatching = () => {
    setSelectedGerman(null);
    setSelectedEnglish(null);
    setMatchedIds([]);
    setMatchingError(null);
  };

  // Fill in blank handlers
  const handleFillChange = (id: string, val: string) => {
    setFillAnswers((prev) => ({ ...prev, [id]: val }));
    setFillSubmitted(false);
  };

  const toggleHint = (id: string) => {
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetFill = () => {
    setFillAnswers({});
    setFillSubmitted(false);
    setShowHints({});
  };

  const isFillCorrect = (item: FillBlankItem) => {
    const userVal = (fillAnswers[item.id] || '').trim().toLowerCase();
    const correctVal = item.correctAnswer.toLowerCase();
    if (userVal === correctVal) return true;
    if (item.acceptedAnswers && item.acceptedAnswers.some((a) => a.toLowerCase() === userVal)) {
      return true;
    }
    return false;
  };

  const correctFillCount = data.fillBlank.filter((item) => isFillCorrect(item)).length;
  const allFillCorrect = fillSubmitted && correctFillCount === data.fillBlank.length;

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation and Track Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/category/learn-german"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub Overview
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wide">
              {data.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.title}
            </h1>
          </div>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">{data.description}</p>
        </div>

        {/* Milestone Badge Counter */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-2xl self-start sm:self-center">
          <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold">Progress Milestone</div>
            <div className="text-amber-700">
              {data.milestonesCompleted} of {data.milestonesTotal} Lessons Completed
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'vocab'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Vocabulary Reference ({data.vocab.length})
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'matching'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          Matching Drill ({matchedIds.length}/{data.matching.pairs.length})
        </button>
        <button
          onClick={() => setActiveTab('fillBlank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'fillBlank'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PenTool className="w-4 h-4" />
          Fill in the Blanks ({data.fillBlank.length})
        </button>
      </div>

      {/* TAB 1: VOCABULARY REFERENCE */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Essential Vocabulary & Pronunciation Guide
            </h3>
            <span className="text-xs text-slate-500">Level {data.levelCode} Core Word Bank</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.vocab.map((item: VocabItem, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {item.article && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-slate-200 text-slate-700 uppercase">
                          {item.article}
                        </span>
                      )}
                      <h4 className="text-lg font-bold text-slate-900">{item.word}</h4>
                    </div>
                    <p className="text-sm font-medium text-red-600 mt-0.5">{item.translation}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    {item.level}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <p className="text-xs text-slate-600 italic">
                    <span className="font-semibold not-italic text-slate-700">Context: </span>
                    "{item.example}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MATCHING DRILL */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{data.matching.title}</h3>
              <p className="text-xs text-slate-600 mt-0.5">{data.matching.instruction}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">
                Matched: {matchedIds.length} / {data.matching.pairs.length}
              </span>
              <button
                onClick={resetMatching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {matchingError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-red-600" />
              {matchingError}
            </div>
          )}

          {matchedIds.length === data.matching.pairs.length ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-emerald-900">Outstanding! All Pairs Matched!</h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                You have successfully connected all German terms with their English definitions for {data.title}.
              </p>
              <button
                onClick={resetMatching}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* German Column */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  German Words
                </h4>
                {data.matching.pairs.map((pair: MatchingPair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedGerman === pair.id;
                  return (
                    <button
                      key={`de-${pair.id}`}
                      disabled={isMatched}
                      onClick={() => handleGermanClick(pair)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 line-through opacity-75'
                          : isSelected
                          ? 'bg-red-50 border-red-500 text-red-900 shadow-sm ring-2 ring-red-400'
                          : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <span>{pair.german}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* English Column */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  English Meanings
                </h4>
                {data.matching.pairs.map((pair: MatchingPair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = selectedEnglish === pair.id;
                  return (
                    <button
                      key={`en-${pair.id}`}
                      disabled={isMatched}
                      onClick={() => handleEnglishClick(pair)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 line-through opacity-75'
                          : isSelected
                          ? 'bg-red-50 border-red-500 text-red-900 shadow-sm ring-2 ring-red-400'
                          : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                      }`}
                    >
                      <span>{pair.english}</span>
                      {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FILL IN THE BLANKS */}
      {activeTab === 'fillBlank' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sentence Completion Drills</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Type the correct German word in the blank space to complete each natural sentence.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {fillSubmitted && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    allFillCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Score: {correctFillCount} / {data.fillBlank.length} Correct
                </span>
              )}
              <button
                onClick={resetFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFillSubmitted(true);
            }}
            className="space-y-5"
          >
            {data.fillBlank.map((item: FillBlankItem, idx: number) => {
              const currentVal = fillAnswers[item.id] || '';
              const correct = isFillCorrect(item);
              const showHint = showHints[item.id];

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    fillSubmitted
                      ? correct
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-rose-50/60 border-rose-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Exercise {idx + 1}: {item.prompt}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleHint(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showHint ? 'Hide Hint' : 'Need a Hint?'}
                    </button>
                  </div>

                  {/* Sentence with interactive inline input */}
                  <div className="text-base sm:text-lg font-medium text-slate-900 flex flex-wrap items-center gap-2">
                    <span>{item.sentenceParts[0]}</span>
                    <input
                      type="text"
                      value={currentVal}
                      onChange={(e) => handleFillChange(item.id, e.target.value)}
                      placeholder="Type word..."
                      className={`px-3 py-1 rounded-lg border text-sm sm:text-base font-bold outline-none transition-all ${
                        fillSubmitted
                          ? correct
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                            : 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-300'
                          : 'border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-slate-50'
                      }`}
                    />
                    <span>{item.sentenceParts[1]}</span>
                  </div>

                  {/* Hint Drawer */}
                  {showHint && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold">Hint: </span>
                      {item.hint}
                    </div>
                  )}

                  {/* Evaluation Result */}
                  {fillSubmitted && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      {correct ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Correct! {item.explanation}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          Expected: <strong className="font-bold">{item.correctAnswer}</strong>. {item.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
              >
                Check Answers
              </button>
              {fillSubmitted && allFillCorrect && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Perfect Score! All answers are correct!
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
