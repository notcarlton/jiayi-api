import { NextRequest, NextResponse } from 'next/server';
import { type IWebhookData, schema } from './validate';

import { env } from '~/env.mjs';
import rateLimit from '~/utils/rate-limit';
import { NextApiResponse } from 'next';
import { IAPIRouteMetaData } from '~/app/api/generateDocs';

export async function POST(req: NextRequest, res: NextApiResponse) {
  const result = schema.safeParse(await req.json());

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

export const meta: IAPIRouteMetaData = {
  desc: 'Raw post request to protected discord webhook',
};
