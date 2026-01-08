import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    merchantAddress: process.env.NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS || 'rXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  });
}

