import { NextRequest, NextResponse } from 'next/server';
import { env } from '~/env.mjs';
import { IWebhookData } from './validate';
import { generateError } from '../error/route';
import { parseLog } from './parse-log';
import { IAPIRouteMetaData } from '~/app/api/generateDocs';

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

  const queryFile = data.get('file');

  if (!queryFile) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request',
        errors: [
          {
            path: ['file'],
            message: 'Expected file',
          },
        ],
      },
      {
        status: 400,
      }
    );
  }

  // @ts-ignore
  const result = await parseLog(await queryFile.text());

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
    user: result.user,
  });

  const formData = new FormData();
  formData.append('payload_json', JSON.stringify(postData));
  formData.append('file', queryFile);

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

export const meta: IAPIRouteMetaData = {
  desc: 'Powerful webhook post, uploading both file, and auto-parsing content to create a data embed (also sent to the webhook)',
};
