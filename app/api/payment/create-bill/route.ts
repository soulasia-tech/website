import { NextResponse } from 'next/server';
import { createBill } from '@/lib/billplz';

export async function POST(request: Request) {
  try {
    console.log('[create-bill] Received payment creation request');
    const { amount, name, email, callback_url, redirect_url, reference_1, reference_2 } = await request.json();

    // Validate required fields
    if (!amount || !name || !email || !callback_url || !redirect_url) {
      console.error('[create-bill] Missing required fields', { amount, name, email, callback_url, redirect_url });
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[create-bill] Sending Billplz payment request for amount: ${amount}`, { name, email, callback_url, redirect_url, reference_1, reference_2 });
    const bill = await createBill({ amount, name, email, callback_url, redirect_url, reference_1, reference_2 });
    console.log('[create-bill] Billplz response:', bill);

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    console.error('[create-bill] Error creating bill:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 