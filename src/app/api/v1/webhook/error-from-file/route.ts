import { NextRequest, NextResponse } from 'next/server';
import { env } from '~/env.mjs';
import { IWebhookData } from './validate';
import { generateError } from '../error/route';
import { parseLog } from './parse-log';

export async function POST(request: NextRequest) {
  let data: FormData;

  try {
    data = await request.formData();
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse form data',
      },
      {
        status: 400,
      }
    );
  }

  const queryData = {
    file: data.get('file'),
    isAnonymous: data.get('isAnonymous'),
  };

  if (!queryData.file || !queryData.isAnonymous) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request',
        errors: [
          !queryData.file && {
            path: ['file'],
            message: 'Expected file',
          },
          !queryData.isAnonymous && {
            path: ['isAnonymous'],
            message: 'Expected boolean',
          },
        ].filter(Boolean),
      },
      {
        status: 400,
      }
    );
  }

  // @ts-ignore
  const result = await parseLog(await queryData.file.text());

  const postData: IWebhookData = generateError({
    main_error: {
      error_name: result.error.name,
      location: result.error.location,
    },
    past_log: result.log_messages.map(x => ({
      level: x.level,
      location: x.sender,
      msg: x.msg,
    })),
    ...(queryData.isAnonymous === 'false' && result.user),
  });

  const formData = new FormData();
  formData.append('file', queryData.file);
  formData.append('payload_json', JSON.stringify(postData));

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
