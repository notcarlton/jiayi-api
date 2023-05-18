import { NextRequest, NextResponse } from 'next/server';
import { type IWebhookData, webhookDataSchema } from './validate';

import { env } from '~/env.mjs';

export async function POST(req: NextRequest) {
  const result = webhookDataSchema.safeParse(await req.json());

  if (!result.success) {
    return NextResponse.json(
      {
        message: 'Invalid request',
        errors: result.error.issues,
      },
      {
        status: 400,
      }
    );
  }

  const data: IWebhookData = {
    ...result.data,
    ...result.data.data,
  };

  const hookResponse = await fetch(env.DISCORD_WEBHOOK, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return NextResponse.json(
    {
      success: hookResponse.ok,
    },
    {
      status: hookResponse.ok ? 200 : hookResponse.status,
    }
  );
}
