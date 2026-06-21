export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('terraprint');
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const tx = await db.collection('transactions').findOne({ _id: new ObjectId(params.id) });
    
    if (!tx) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(tx);
  } catch (err) {
    console.error('Failed to fetch transaction', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
