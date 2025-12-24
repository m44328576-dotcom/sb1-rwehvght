import { useState } from 'react';
import { LogOut, User, Wallet as WalletIcon, Menu, X, Grid3x3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  currentView: 'marketplace' | 'dashboard' | 'wallet';
  onViewChange: (view: 'marketplace' | 'dashboard' | 'wallet') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-2 rounded-lg">
                <Grid3x3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PixelMarket</h1>
                <p className="text-xs text-slate-400">سوق تداول البكسلز الرقمية</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onViewChange('marketplace')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  currentView === 'marketplace'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                السوق
              </button>
              {user && (
                <>
                  <button
                    onClick={() => onViewChange('dashboard')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentView === 'dashboard'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    لوحة التحكم
                  </button>
                  <button
                    onClick={() => onViewChange('wallet')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentView === 'wallet'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    المحفظة
                  </button>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <User className="text-blue-400" size={20} />
                    <span className="text-white font-semibold">{profile?.username}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg"
                  >
                    <LogOut size={18} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg"
                >
                  <User size={18} />
                  تسجيل الدخول
                </button>
              )}

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-slate-700">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onViewChange('marketplace');
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-right px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    currentView === 'marketplace'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  السوق
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => {
                        onViewChange('dashboard');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-right px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        currentView === 'dashboard'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      لوحة التحكم
                    </button>
                    <button
                      onClick={() => {
                        onViewChange('wallet');
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-right px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        currentView === 'wallet'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      المحفظة
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-right px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-semibold"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                )}
                {!user && (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-right px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold"
                  >
                    تسجيل الدخول
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
