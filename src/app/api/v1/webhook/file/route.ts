import { NextRequest, NextResponse } from 'next/server';
import { env } from '~/env.mjs';
import { schema } from './validate';

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const queryData = {
    file: data.get('file'),
    payload_json: data.get('payload_json'),
  };

  const safeResult = schema.safeParse(
    JSON.parse(queryData.payload_json?.valueOf().toString() || '{}')
  );
  if (!queryData.file || !queryData.payload_json || !safeResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request',
        errors: [
          !queryData.file && {
            path: ['file'],
            message: 'Expected file',
          },
          !safeResult.success && {
            path: ['payload_json'],
            errors: safeResult.error,
          },
        ].filter(Boolean),
      },
      {
        status: 400,
      }
    );
  }

  const formData = new FormData();
  formData.append('file', queryData.file);
  formData.append(
    'payload_json',
    JSON.stringify({
      ...safeResult.data,
      ...safeResult.data.data,
    })
  );

  const fileResponse = await fetch(env.DISCORD_WEBHOOK, {
    method: 'POST',
    body: formData,
  });

  if (!fileResponse.ok) {
    return NextResponse.json(
      { success: false },
      {
        status: fileResponse.status,
      }
    );
  }

  return NextResponse.json(
    { success: true },
    {
      status: 200,
    }
  );
}
