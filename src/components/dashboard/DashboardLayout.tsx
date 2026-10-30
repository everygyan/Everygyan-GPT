import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Inbox,
  Users,
  Users2,
  Send,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { SeoHead } from '../common/SeoHead';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name: string; role: string; email: string };
  onSignOut?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user = { name: 'Sandeep', role: 'admin', email: 'sandeep@everygyan.com' },
  onSignOut,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Articles', href: '/dashboard/articles', icon: FileText },
    { name: 'Comments', href: '/dashboard/comments', icon: MessageSquare },
    { name: 'Messages', href: '/dashboard/messages', icon: Inbox },
    { name: 'Subscribers', href: '/dashboard/subscribers', icon: Users },
    { name: 'Newsletter', href: '/dashboard/newsletter', icon: Send },
    { name: 'About & Team', href: '/dashboard/about', icon: Users2 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <SeoHead
        title="Editorial Dashboard"
        description="EveryGyan internal editorial management dashboard."
        robots="noindex, nofollow"
      />
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Every<span className="text-red-500">Gyan</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
          aria-label="Toggle Dashboard Menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white">
                Every<span className="text-red-500">Gyan</span>
              </span>
              <span className="text-[10px] text-slate-400">Editorial Dashboard</span>
            </Link>
          </div>

          {/* User Profile Info Card */}
          <div className="p-4 mx-3 my-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/80">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1" aria-label="Dashboard Sidebar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Live Site & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-1.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
