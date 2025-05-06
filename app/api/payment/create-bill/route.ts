import { NextResponse } from 'next/server';
import { createBill } from '@/lib/billplz';

export async function POST(request: Request) {
  try {
    const { amount, name, email, callback_url, redirect_url } = await request.json();

    // Validate required fields
    if (!amount || !name || !email || !callback_url || !redirect_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Use the mock Billplz utility for now
    const bill = await createBill({ amount, name, email, callback_url, redirect_url });

    return NextResponse.json({ success: true, bill });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 