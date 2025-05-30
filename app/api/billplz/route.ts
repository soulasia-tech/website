import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.BILLPLZ_API_KEY;
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;

  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Missing BILLPLZ_API_KEY' }, { status: 500 });
  }
  if (!collectionId) {
    return NextResponse.json({ success: false, error: 'Missing BILLPLZ_COLLECTION_ID' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://www.billplz.com/api/v3/collections/${collectionId}`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(apiKey + ':').toString('base64'),
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 