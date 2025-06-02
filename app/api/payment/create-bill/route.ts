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

    // --- TESTING OVERRIDE: Always use amount = 100 (1 MYR) for payment provider ---
    const testAmount = 100; // 1 MYR in cents
    console.log(`[create-bill] Sending Billplz payment request for 1 MYR (amount: ${testAmount})`, { name, email, callback_url, redirect_url, reference_1, reference_2 });
    // Use the real Billplz utility
    const bill = await createBill({ amount: testAmount, name, email, callback_url, redirect_url, reference_1, reference_2 });
    console.log('[create-bill] Billplz response:', bill);

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    console.error('[create-bill] Error creating bill:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 