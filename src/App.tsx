import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { PixelGrid } from './components/PixelGrid';
import { PixelDetail } from './components/PixelDetail';
import { Dashboard } from './components/Dashboard';
import { Wallet } from './components/Wallet';
import { MarketStats } from './components/MarketStats';
import { Pixel } from './lib/supabase';

function App() {
  const [currentView, setCurrentView] = useState<'marketplace' | 'dashboard' | 'wallet'>('marketplace');
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePixelUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Header currentView={currentView} onViewChange={setCurrentView} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'marketplace' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 rounded-2xl p-8 border border-blue-700 shadow-2xl">
                <h2 className="text-4xl font-bold text-white mb-3">
                  سوق تداول البكسلز الرقمية
                </h2>
                <p className="text-blue-200 text-lg">
                  اشتري وبيع وتداول مليون بكسل رقمي مع تسعير ديناميكي وتحقق من الملكية عبر البلوك تشين
                </p>
              </div>

              <MarketStats />

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-white">شبكة البكسلز (1,000 × 1,000)</h3>
                  <p className="text-slate-400 mt-1">
                    انقر على أي بكسل لعرض التفاصيل أو الشراء. استخدم الماوس للتكبير والتصغير والتنقل
                  </p>
                </div>
                <div className="h-[600px]">
                  <PixelGrid key={refreshKey} onPixelClick={setSelectedPixel} />
                </div>
              </div>
            </div>
          )}

          {currentView === 'dashboard' && <Dashboard key={refreshKey} />}

          {currentView === 'wallet' && <Wallet />}
        </main>

        <PixelDetail
          pixel={selectedPixel}
          onClose={() => setSelectedPixel(null)}
          onUpdate={handlePixelUpdate}
        />

        <footer className="bg-slate-900 border-t border-slate-800 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-slate-400">
              <p className="text-lg font-semibold mb-2">PixelMarket - منصة تداول البكسلز الرقمية</p>
              <p className="text-sm">نظام تسعير ديناميكي • محافظ رقمية آمنة • تحقق بلوك تشين</p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
