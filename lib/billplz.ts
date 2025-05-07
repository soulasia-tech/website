// Mock Billplz API abstraction

interface CreateBillParams {
  amount: number;
  name: string;
  email: string;
  callback_url: string;
  redirect_url: string;
  reference_1?: string;
}

interface VerifyPaymentParams {
  bill_id: string;
  x_signature: string;
}

export async function createBill({ amount, name, email, callback_url, redirect_url, reference_1 }: CreateBillParams) {
  const apiKey = process.env.BILLPLZ_API_KEY;
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;
  if (!apiKey || !collectionId) {
    throw new Error('Missing BILLPLZ_API_KEY or BILLPLZ_COLLECTION_ID');
  }

  const payload: Record<string, any> = {
    collection_id: collectionId,
    description: `Booking for ${name}`,
    email,
    name,
    amount,
    callback_url,
    redirect_url,
    reference_1,
    reference_1_label: 'Booking Data',
  };

  const res = await fetch('https://www.billplz.com/api/v3/bills', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to create Billplz bill');
  }
  return data;
}

export async function verifyPayment({ bill_id, x_signature: _x_signature }: VerifyPaymentParams) {
  const apiKey = process.env.BILLPLZ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing BILLPLZ_API_KEY');
  }
  void _x_signature; // In production, verify the signature as per Billplz docs
  const res = await fetch(`https://www.billplz.com/api/v3/bills/${bill_id}`, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to verify Billplz payment');
  }
  return data;
} 