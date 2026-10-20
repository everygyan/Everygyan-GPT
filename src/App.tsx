import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Baseline Header */}
        <header className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">everygyan</span>
              <span className="text-xs text-slate-400 hidden sm:inline">Knowledge for Everyone, Everywhere</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-emerald-400 text-xs px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                Baseline OK
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
          <Routes>
            <Route
              path="/"
              element={
                <div className="text-center py-12">
                  <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-full mb-4">
                    <Newspaper className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">EveryGyan Web Platform</h1>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Baseline scaffold initialized with React, Vite, TypeScript, and Tailwind CSS.
                  </p>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Baseline Footer */}
        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
          <p>© 2026 EveryGyan. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
