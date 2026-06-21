export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { actionId: string; amountKgCo2e?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { actionId, amountKgCo2e = 450 } = body;

  try {
    // Simulate latency of calling a 3rd-party sandbox API (Patch/Cloverly)
    await new Promise((r) => setTimeout(r, 1200));

    // Generate a mock confirmation ID to simulate a successful API response
    const confirmationId = `txn_sandbox_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date();

    const client = await clientPromise;
    const db = client.db('terraprint');
    
    // Write transaction to MongoDB
    const result = await db.collection('transactions').insertOne({
      userId: (session.user as any).id,
      actionId,
      provider: 'Patch (Sandbox)',
      amountKgCo2e,
      confirmationId,
      costUsd: 9.50, // Mock cost
      timestamp,
      status: 'completed',
    });

    return NextResponse.json({ 
      success: true, 
      transactionId: result.insertedId.toString(),
      confirmationId,
    });
  } catch (err) {
    console.error('[Marketplace API] Error processing offset:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
