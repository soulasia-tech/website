import { createHmac, timingSafeEqual } from 'crypto';

interface CreateBillParams {
    amount: number;
    name: string;
    email: string;
    callback_url: string;
    redirect_url: string;
    reference_1?: string;
    reference_2?: string;
}

interface VerifyPaymentParams {
    params: Record<string, string>;
    x_signature: string;
}

// Returns true if signature is valid.
// If BILLPLZ_X_SIGNATURE_KEY is not configured, logs a warning and returns true
// (warn-only mode) so existing payments keep working while you set up the key.
// Once the key is present, an invalid signature returns false and blocks the callback.
export function verifyXSignature(params: Record<string, string>, receivedSignature: string): boolean {
    const xSignatureKey = process.env.BILLPLZ_X_SIGNATURE_KEY;
    if (!xSignatureKey) {
        console.warn('[billplz] BILLPLZ_X_SIGNATURE_KEY is not set — skipping signature verification. Set this env var to enable webhook security.');
        return true;
    }
    const source = Object.keys(params)
        .filter(k => k !== 'x_signature')
        .sort()
        .map(k => `${k}|${params[k]}`)
        .join('|');
    const computed = createHmac('sha256', xSignatureKey).update(source).digest('hex');
    const a = Buffer.from(computed);
    const b = Buffer.from(receivedSignature);
    return a.length === b.length && timingSafeEqual(a, b);
}

export async function createBill({amount, name, email, callback_url, redirect_url, reference_1, reference_2}: CreateBillParams) {
    const apiKey = process.env.BILLPLZ_API_KEY;
    const collectionId = process.env.BILLPLZ_COLLECTION_ID;
    if (!apiKey || !collectionId) {
        throw new Error('Missing BILLPLZ_API_KEY or BILLPLZ_COLLECTION_ID');
    }

    const payload: Record<string, string | number | undefined> = {
        collection_id: collectionId,
        description: `Booking for ${name}`,
        email,
        name,
        amount,
        callback_url,
        redirect_url,
        reference_1,
        reference_1_label: 'Booking Data',
        reference_2,
        reference_2_label: 'Property ID',
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

export async function verifyPayment({params, x_signature}: VerifyPaymentParams) {
    const apiKey = process.env.BILLPLZ_API_KEY;
    if (!apiKey) {
        throw new Error('Missing BILLPLZ_API_KEY');
    }
    if (!verifyXSignature(params, x_signature)) {
        throw new Error('Invalid x_signature — possible forged callback');
    }
    const bill_id = params.id || params.bill_id;
    console.log('[verifyPayment] Fetching Billplz bill:', bill_id);
    const res = await fetch(`https://www.billplz.com/api/v3/bills/${bill_id}`, {
        headers: {
            Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();
    console.log('[verifyPayment] Billplz API response:', data);
    if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to verify Billplz payment');
    }
    return data;
} 
