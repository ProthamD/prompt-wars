export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are Terraprint's AI Carbon Coach. You are grounded, empathetic, and evidence-based.

Rules:
1. Only cite the user's actual footprint data (provided in context) and verified emission factors (DEFRA 2023, EPA EEIO).
2. NEVER shame users — frame everything as opportunity, not failure.
3. NEVER invent emission factors or percentages. If uncertain, say so.
4. Keep responses concise (3–5 sentences) unless the user asks for detail.
5. Always suggest a SPECIFIC next action.
6. Be equity-aware: never assume the user can afford expensive changes.
7. Use **bold** for emphasis. Use numbered lists for action steps.
8. Respond in plain text — no markdown headers, no code blocks.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured' },
      { status: 500 }
    );
  }

  let body: {
    message: string;
    context?: Record<string, unknown>;
    history?: { role: 'user' | 'assistant'; content: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, context = {}, history = [] } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Build a rich context string from the user's actual footprint data
  const contextStr = Object.keys(context).length > 0
    ? `\n\nUSER'S FOOTPRINT DATA:\n${JSON.stringify(context, null, 2)}`
    : '';

  const groq = new Groq({ apiKey });

  try {
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT + contextStr },
      // Include last 6 messages of history for context (avoid token bloat)
      ...history.slice(-6).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.4,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[Coach API] Groq error:', err?.message ?? err);
    return NextResponse.json(
      { error: `AI unavailable: ${err?.message ?? 'Unknown error'}` },
      { status: 502 }
    );
  }
}
