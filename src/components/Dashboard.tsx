import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Grid3x3 } from 'lucide-react';
import { supabase, Pixel, Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const [ownedPixels, setOwnedPixels] = useState<Pixel[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalPixels: 0,
    totalValue: 0,
    totalSpent: 0,
    totalEarned: 0,
  });
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const { data: pixels } = await supabase
      .from('pixels')
      .select('*')
      .eq('owner_id', user.id);

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(10);

    setOwnedPixels(pixels || []);
    setTransactions(txs || []);

    const totalValue = (pixels || []).reduce((sum, p) => sum + p.current_price, 0);

    setStats({
      totalPixels: pixels?.length || 0,
      totalValue,
      totalSpent: profile?.total_spent || 0,
      totalEarned: profile?.total_earned || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-700 p-3 rounded-lg">
              <Grid3x3 className="text-white" size={24} />
            </div>
            <TrendingUp className="text-blue-400" size={20} />
          </div>
          <div className="text-blue-200 text-sm mb-1">إجمالي البكسلز</div>
          <div className="text-3xl font-bold text-white">{stats.totalPixels}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl p-6 border border-emerald-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-700 p-3 rounded-lg">
              <DollarSign className="text-white" size={24} />
            </div>
            <TrendingUp className="text-emerald-400" size={20} />
          </div>
          <div className="text-emerald-200 text-sm mb-1">القيمة الإجمالية</div>
          <div className="text-3xl font-bold text-white">{stats.totalValue.toFixed(4)} ETH</div>
        </div>

        <div className="bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl p-6 border border-amber-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-amber-700 p-3 rounded-lg">
              <ShoppingBag className="text-white" size={24} />
            </div>
          </div>
          <div className="text-amber-200 text-sm mb-1">إجمالي المصروفات</div>
          <div className="text-3xl font-bold text-white">{stats.totalSpent.toFixed(4)} ETH</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-700 p-3 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <div className="text-purple-200 text-sm mb-1">إجمالي الأرباح</div>
          <div className="text-3xl font-bold text-white">{stats.totalEarned.toFixed(4)} ETH</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">البكسلز المملوكة</h3>
        {ownedPixels.length === 0 ? (
          <div className="text-center py-12">
            <Grid3x3 className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">لا تملك أي بكسلز بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedPixels.slice(0, 12).map((pixel) => (
              <div
                key={pixel.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <div className="text-slate-400 text-xs mb-2">#{pixel.id}</div>
                <div className="text-white font-semibold text-sm mb-1">
                  {pixel.x}, {pixel.y}
                </div>
                <div className="text-emerald-400 text-sm font-bold">
                  {pixel.current_price.toFixed(4)} ETH
                </div>
                {pixel.is_for_sale && (
                  <div className="mt-2 bg-amber-900 text-amber-200 text-xs px-2 py-1 rounded">
                    للبيع
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">آخر المعاملات</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">لا توجد معاملات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between"
              >
                <div>
                  <div className="text-white font-semibold mb-1">
                    {tx.buyer_id === user?.id ? 'شراء' : 'بيع'} البكسل #{tx.pixel_id}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {new Date(tx.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {tx.blockchain_hash && (
                    <div className="text-blue-400 text-xs mt-1 font-mono">
                      {tx.blockchain_hash.slice(0, 16)}...
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div
                    className={`text-2xl font-bold ${
                      tx.buyer_id === user?.id ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {tx.buyer_id === user?.id ? '-' : '+'}
                    {tx.sale_price.toFixed(4)} ETH
                  </div>
                  <div className="text-slate-400 text-sm">
                    عمولة: {tx.commission_amount.toFixed(4)} ETH
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
