import { useState } from 'react';
import { X, ShoppingCart, DollarSign, Image, Link as LinkIcon } from 'lucide-react';
import { Pixel } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { buyPixel, listPixelForSale } from '../services/pixelService';

interface PixelDetailProps {
  pixel: Pixel | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function PixelDetail({ pixel, onClose, onUpdate }: PixelDetailProps) {
  const [loading, setLoading] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [contentType, setContentType] = useState<'ad' | 'nft'>('ad');
  const { user, profile } = useAuth();

  if (!pixel) return null;

  const isOwner = pixel.owner_id === user?.id;
  const canBuy = pixel.is_for_sale && !isOwner && user;

  const handleBuy = async () => {
    if (!user || !canBuy) return;

    setLoading(true);
    try {
      await buyPixel(pixel.id, user.id);
      alert('تم شراء البكسل بنجاح!');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`فشل الشراء: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleListForSale = async () => {
    if (!isOwner || !salePrice) return;

    setLoading(true);
    try {
      await listPixelForSale(pixel.id, parseFloat(salePrice));
      alert('تم عرض البكسل للبيع بنجاح!');
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(`فشل العرض للبيع: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = (price: number) => {
    return price * 0.05;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            البكسل #{pixel.id}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">الموقع</div>
              <div className="text-white font-semibold">
                X: {pixel.x}, Y: {pixel.y}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">السعر الحالي</div>
              <div className="text-2xl font-bold text-emerald-400">
                {pixel.current_price.toFixed(4)} ETH
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">النوع</div>
              <div className="text-white font-semibold capitalize">
                {pixel.content_type === 'empty' ? 'فارغ' : pixel.content_type === 'ad' ? 'إعلان' : 'NFT'}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">عدد المبيعات</div>
              <div className="text-white font-semibold">
                {pixel.times_sold}
              </div>
            </div>
          </div>

          {pixel.content_url && (
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-2">محتوى البكسل</div>
              <img
                src={pixel.content_url}
                alt="Pixel content"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {canBuy && (
            <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white text-lg font-semibold mb-1">
                    شراء هذا البكسل
                  </div>
                  <div className="text-blue-200 text-sm">
                    العمولة: {calculateCommission(pixel.current_price).toFixed(4)} ETH (5%)
                  </div>
                  <div className="text-white font-bold mt-2">
                    الإجمالي: {(pixel.current_price + calculateCommission(pixel.current_price)).toFixed(4)} ETH
                  </div>
                </div>
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  <ShoppingCart size={20} />
                  {loading ? 'جاري الشراء...' : 'شراء الآن'}
                </button>
              </div>
            </div>
          )}

          {isOwner && !pixel.is_for_sale && (
            <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-lg p-6">
              <div className="text-white text-lg font-semibold mb-4">
                عرض للبيع
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">
                    السعر (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">
                    نوع المحتوى
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as 'ad' | 'nft')}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="ad">إعلان</option>
                    <option value="nft">NFT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">
                    رابط المحتوى (اختياري)
                  </label>
                  <input
                    type="url"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <button
                  onClick={handleListForSale}
                  disabled={loading || !salePrice}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  <DollarSign size={20} />
                  {loading ? 'جاري العرض...' : 'عرض للبيع'}
                </button>
              </div>
            </div>
          )}

          {isOwner && pixel.is_for_sale && (
            <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-lg p-6">
              <div className="text-white text-center">
                <div className="text-lg font-semibold mb-2">
                  البكسل معروض للبيع
                </div>
                <div className="text-emerald-200">
                  السعر: {pixel.current_price.toFixed(4)} ETH
                </div>
              </div>
            </div>
          )}

          {!user && (
            <div className="bg-slate-800 rounded-lg p-6 text-center">
              <div className="text-white text-lg mb-2">
                سجل دخولك لشراء البكسلز
              </div>
              <div className="text-slate-400">
                قم بإنشاء حساب أو تسجيل الدخول للبدء في التداول
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
