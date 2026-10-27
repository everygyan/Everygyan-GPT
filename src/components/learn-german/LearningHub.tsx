import React from 'react';
import { NavLink } from 'react-router-dom';

const levels = [
  { id: 'a1', name: 'A1', description: 'Beginner', unlocked: true },
  { id: 'a2', name: 'A2', description: 'Elementary', unlocked: true },
  { id: 'b1', name: 'B1', description: 'Intermediate', unlocked: false },
];

export const LearningHub: React.FC = () => {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Learning Hub</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((lvl) => (
          <NavLink
            key={lvl.id}
            to={`/category/learn-german/${lvl.id}`}
            className={({ isActive }) =>
              `p-6 rounded-xl border transition-colors ${isActive ? 'border-red-600 bg-red-50' : 'border-slate-200 hover:border-red-400'} `
            }
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-semibold">{lvl.name}</span>
              <span>{lvl.unlocked ? '✅' : '🔒'}</span>
            </div>
            <p className="text-sm text-slate-600">{lvl.description}</p>
          </NavLink>
        ))}
      </div>
    </section>
  );
};
