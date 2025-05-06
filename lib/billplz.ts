// Mock Billplz API abstraction

interface CreateBillParams {
  amount: number;
  name: string;
  email: string;
  callback_url: string;
  redirect_url: string;
}

interface VerifyPaymentParams {
  bill_id: string;
  x_signature: string;
}

export async function createBill({ amount, name, email, callback_url, redirect_url }: CreateBillParams) {
  // Simulate Billplz's create bill response
  return {
    id: 'mock_bill_id_123',
    collection_id: 'placeholder_collection_id',
    paid: false,
    state: 'pending',
    amount,
    url: 'https://www.billplz.com/bills/mock_bill_id_123',
    callback_url,
    redirect_url,
    name,
    email,
    // ...other fields as per Billplz docs
  };
}

export async function verifyPayment({ bill_id, x_signature: _x_signature }: VerifyPaymentParams) {
  // Use the variable to avoid lint error
  void _x_signature;
  // Simulate Billplz payment verification
  // In real implementation, verify signature and fetch bill status
  return {
    id: bill_id,
    paid: true,
    state: 'paid',
    paid_at: new Date().toISOString(),
    // ...other fields as per Billplz docs
  };
} 