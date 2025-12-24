import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function MarketStats() {
  const [stats, setStats] = useState({
    totalPixelsSold: 0,
    totalVolume: 0,
    averagePrice: 0,
    activeTraders: 0,
    priceChange24h: 0,
  });

  useEffect(() => {
    loadMarketStats();
    const interval = setInterval(loadMarketStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketStats = async () => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed');

    const { data: pixels } = await supabase
      .from('pixels')
      .select('current_price, times_sold')
      .gt('times_sold', 0);

    const totalVolume = transactions?.reduce((sum, tx) => sum + tx.sale_price, 0) || 0;
    const totalPixelsSold = pixels?.reduce((sum, p) => sum + p.times_sold, 0) || 0;
    const averagePrice = pixels?.length
      ? pixels.reduce((sum, p) => sum + p.current_price, 0) / pixels.length
      : 0;

    const uniqueTraders = new Set([
      ...(transactions?.map((tx) => tx.buyer_id) || []),
      ...(transactions?.map((tx) => tx.seller_id).filter(Boolean) || []),
    ]).size;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('price_history')
      .select('price')
      .gte('recorded_at', oneDayAgo);

    const priceChange =
      recent && recent.length > 0
        ? ((averagePrice - recent[0].price) / recent[0].price) * 100
        : 0;

    setStats({
      totalPixelsSold,
      totalVolume,
      averagePrice,
      activeTraders: uniqueTraders,
      priceChange24h: priceChange,
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-lg">
          <Activity className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">إحصائيات السوق</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-400" size={18} />
            <div className="text-slate-400 text-sm">إجمالي المبيعات</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalPixelsSold.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-emerald-400" size={18} />
            <div className="text-slate-400 text-sm">حجم التداول</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalVolume.toFixed(2)} ETH</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-amber-400" size={18} />
            <div className="text-slate-400 text-sm">متوسط السعر</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.averagePrice.toFixed(4)} ETH</div>
          <div
            className={`text-xs mt-1 ${
              stats.priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {stats.priceChange24h >= 0 ? '+' : ''}
            {stats.priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-purple-400" size={18} />
            <div className="text-slate-400 text-sm">المتداولون النشطون</div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeTraders}</div>
        </div>
      </div>
    </div>
  );
}
