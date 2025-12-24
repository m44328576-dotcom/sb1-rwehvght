import { supabase } from '../lib/supabase';

export async function buyPixel(pixelId: number, buyerId: string) {
  const { data: pixel, error: pixelError } = await supabase
    .from('pixels')
    .select('*, profiles!pixels_owner_id_fkey(username)')
    .eq('id', pixelId)
    .maybeSingle();

  if (pixelError) throw pixelError;
  if (!pixel) throw new Error('Pixel not found');
  if (!pixel.is_for_sale) throw new Error('Pixel is not for sale');
  if (pixel.owner_id === buyerId) throw new Error('You already own this pixel');

  const salePrice = pixel.current_price;
  const commissionRate = 5.0;
  const commissionAmount = salePrice * (commissionRate / 100);
  const netAmount = salePrice - commissionAmount;

  const blockchainHash = generateBlockchainHash(pixelId, buyerId, salePrice);

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([
      {
        pixel_id: pixelId,
        seller_id: pixel.owner_id,
        buyer_id: buyerId,
        sale_price: salePrice,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        net_amount: netAmount,
        payment_method: 'ETH',
        blockchain_hash: blockchainHash,
        status: 'completed',
      },
    ])
    .select()
    .single();

  if (transactionError) throw transactionError;

  const newPrice = calculateDynamicPrice(salePrice, pixel.times_sold + 1);

  const { error: updateError } = await supabase
    .from('pixels')
    .update({
      owner_id: buyerId,
      purchase_price: salePrice,
      current_price: newPrice,
      is_for_sale: false,
      times_sold: pixel.times_sold + 1,
      last_sale_at: new Date().toISOString(),
    })
    .eq('id', pixelId);

  if (updateError) throw updateError;

  await supabase.from('price_history').insert([
    {
      pixel_id: pixelId,
      price: salePrice,
      volume: pixel.times_sold + 1,
      liquidity_score: calculateLiquidityScore(pixel.times_sold + 1),
      demand_score: calculateDemandScore(newPrice, salePrice),
    },
  ]);

  if (pixel.owner_id) {
    await supabase.rpc('increment_user_earnings', {
      user_id: pixel.owner_id,
      amount: netAmount,
    });
  }

  await supabase.rpc('increment_user_spending', {
    user_id: buyerId,
    amount: salePrice + commissionAmount,
  });

  return transaction;
}

export async function listPixelForSale(pixelId: number, price: number) {
  const { error } = await supabase
    .from('pixels')
    .update({
      current_price: price,
      is_for_sale: true,
    })
    .eq('id', pixelId);

  if (error) throw error;
}

function calculateDynamicPrice(currentPrice: number, timesSold: number): number {
  const demandMultiplier = 1 + (timesSold * 0.05);
  const liquidityFactor = Math.log10(timesSold + 10) / 10;
  const marketVolatility = 1 + (Math.random() * 0.1 - 0.05);

  const newPrice = currentPrice * demandMultiplier * (1 + liquidityFactor) * marketVolatility;

  return Math.max(newPrice, 0.0001);
}

function calculateLiquidityScore(timesSold: number): number {
  return Math.min(timesSold / 10, 10);
}

function calculateDemandScore(newPrice: number, oldPrice: number): number {
  const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
  return Math.max(0, Math.min(priceChange, 100));
}

function generateBlockchainHash(pixelId: number, buyerId: string, price: number): string {
  const data = `${pixelId}-${buyerId}-${price}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}
