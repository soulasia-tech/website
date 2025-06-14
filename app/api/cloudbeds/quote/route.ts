import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const cartRaw = searchParams.get('cart');
  if (!propertyId || !checkIn || !checkOut || !cartRaw) {
    return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
  }
  if (!cartRaw || typeof cartRaw !== 'string') {
    return NextResponse.json({ success: false, message: 'Missing or invalid cart parameter' }, { status: 400 });
  }
  let cart;
  try {
    cart = JSON.parse(cartRaw);
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid cart format' }, { status: 400 });
  }
  // Calculate subtotal
  const subtotal = cart.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  // Simulate SST 8%
  const sst = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + sst) * 100) / 100;
  return NextResponse.json({
    success: true,
    quote: {
      subtotal,
      sst,
      grandTotal,
      breakdown: { subtotal, sst, grandTotal }
    }
  });
} 