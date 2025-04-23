import { NextResponse } from 'next/server';
import type { ApiResponse, PaymentRequest, PaymentDetails } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body: PaymentRequest = await request.json();

    // Validate request
    if (!body.bookingId || !body.paymentMethod || !body.amount) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock payment response
    const payment: PaymentDetails = {
      id: `payment_${Date.now()}`,
      status: 'succeeded',
      amount: body.amount,
      currency: 'USD',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json<ApiResponse<PaymentDetails>>({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Failed to process payment'
    }, { status: 500 });
  }
} 