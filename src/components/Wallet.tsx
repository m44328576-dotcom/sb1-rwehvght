import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, Send, RefreshCw } from 'lucide-react';
import { supabase, Wallet as WalletType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Wallet() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [currency, setCurrency] = useState('ETH');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWallets();
    }
  }, [user]);

  const loadWallets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading wallets:', error);
      return;
    }

    setWallets(data || []);
  };

  const createWallet = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const walletAddress = generateWalletAddress();
      const encryptedKey = generateEncryptedKey();

      const { error } = await supabase.from('wallets').insert([
        {
          user_id: user.id,
          wallet_address: walletAddress,
          balance: 0,
          encrypted_key: encryptedKey,
          currency: currency,
        },
      ]);

      if (error) throw error;

      await loadWallets();
      setShowAddWallet(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('فشل إنشاء المحفظة');
    } finally {
      setLoading(false);
    }
  };

  const generateWalletAddress = (): string => {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };

  const generateEncryptedKey = (): string => {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-lg">
            <WalletIcon className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">محفظتي</h2>
        </div>
        <button
          onClick={() => setShowAddWallet(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          محفظة جديدة
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-12">
          <WalletIcon className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 mb-4">لا توجد محافظ بعد</p>
          <button
            onClick={() => setShowAddWallet(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
          >
            إنشاء محفظة
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <WalletIcon className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">عنوان المحفظة</div>
                    <div className="text-white font-mono text-sm">
                      {wallet.wallet_address.slice(0, 10)}...
                      {wallet.wallet_address.slice(-8)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm">الرصيد</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {wallet.balance.toFixed(4)} {wallet.currency}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Plus size={18} />
                  إيداع
                </button>
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Send size={18} />
                  سحب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">إنشاء محفظة جديدة</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  العملة الرقمية
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="BNB">Binance Coin (BNB)</option>
                </select>
              </div>

              <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  سيتم إنشاء عنوان محفظة فريد ومفتاح خاص مشفر لك.
                  احتفظ بمعلومات محفظتك بشكل آمن.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={createWallet}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء'}
                </button>
                <button
                  onClick={() => setShowAddWallet(false)}
                  className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition-all duration-200"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
