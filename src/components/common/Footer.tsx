import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1120] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand Info */}
          <div>
            <Link to="/" className="inline-block mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                every<span className="text-red-500">gyan</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4 font-medium">
              Knowledge for Everyone, Everywhere
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              An independent digital publication covering technology breakthroughs, enterprise learning, global perspectives, wellness, and family-friendly travel.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/tech" className="text-slate-400 hover:text-white transition-colors">
                  Tech
                </Link>
              </li>
              <li>
                <Link to="/category/health" className="text-slate-400 hover:text-white transition-colors">
                  Health
                </Link>
              </li>
              <li>
                <Link to="/category/geopolitics" className="text-slate-400 hover:text-white transition-colors">
                  Geopolitics
                </Link>
              </li>
              <li>
                <Link to="/category/sports" className="text-slate-400 hover:text-white transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/category/travel" className="text-slate-400 hover:text-white transition-colors">
                  Travel
                </Link>
              </li>
              <li>
                <Link to="/category/learning" className="text-slate-400 hover:text-white transition-colors">
                  Learning
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Socials */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Follow Us
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Stay connected across our social channels for daily insights and story highlights.
            </p>
            <div className="flex items-center space-x-3 text-slate-400">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-md transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 EveryGyan. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-slate-300">Home</Link>
            <Link to="/about" className="hover:text-slate-300">About Us</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
