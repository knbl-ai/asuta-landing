import { NextResponse } from 'next/server';
import { deliverLead } from '@/lib/leadDelivery';
import { validateLead } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot filled in: pretend it worked so bots don't retry.
  if (body.company) return NextResponse.json({ ok: true });

  const errors = validateLead(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  try {
    const { ok, results } = await deliverLead(
      {
        fullName: body.fullName,
        phone: body.phone,
        department: body.department,
        gclid: typeof body.gclid === 'string' ? body.gclid : '',
        source: request.headers.get('referer') || origin,
      },
      { returnUrl: `${origin}/thank-you` },
    );
    // No personal details in the logs.
    console.log('[lead]', JSON.stringify({ ok, gclid: !!body.gclid, results }));
    if (!ok) return NextResponse.json({ ok: false, error: 'crm_error' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[lead] delivery failed:', err.message);
    return NextResponse.json({ ok: false, error: 'crm_unreachable' }, { status: 502 });
  }
}
