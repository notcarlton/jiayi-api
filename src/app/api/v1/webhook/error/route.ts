import { NextRequest, NextResponse } from 'next/server';
import { IPostSchema, schema } from './validate';

import { env } from '~/env.mjs';
import type { IWebhookData } from '../validate';
import { IAPIRouteMetaData } from '~/app/api/generateDocs';

export async function POST(req: NextRequest) {
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

  const query = result.data;

  const data = generateError(query);

  const hookResponse = await fetch(env.DISCORD_WEBHOOK, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (hookResponse.status !== 204) {
    return NextResponse.json(
      { success: false },
      { status: hookResponse.status }
    );
  }

  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    }
  );
}

export function generateError(query: IPostSchema) {
  let log: IPostSchema['past_log'][0][] = [query.past_log[0]];

  for (let i = 1; i < query.past_log.length; i++) {
    const logItem = query.past_log[i];

    const pastName = `${log[log.length - 1].location} - ${
      log[log.length - 1].level
    }`;
    const name = `${logItem.location} - ${logItem.level}`;
    if (pastName == name) {
      log[log.length - 1] = {
        ...log[log.length - 1],
        msg: log[log.length - 1].msg + `\n${logItem.msg}`,
      };
      continue;
    }

    log.push(logItem);
  }

  const data: IWebhookData = {
    username: 'Jiayi Error Log',
    avatar_url:
      'https://cdn.discordapp.com/icons/1076188174407176212/c42955c501c842e06248b294a81bd0ab.png',
    embeds: [
      {
        title: query.main_error.error_name,
        description: `${
          query.user ? query.user?.name + '#' + query.user?.discrim + '\n' : ''
        }${query.main_error.location.file_name} -> Line ${
          query.main_error.location.line
        }`,
        fields: [
          { name: '', value: '**Log Synopsis**' },
          ...log.map(x => ({
            name: `${x.location} - ${x.level}`,
            value: `${x.msg}`,
          })),
        ],
        color: 15548997,
      },
    ],
  };

  return data;
}

export const meta: IAPIRouteMetaData = {
  desc: 'Send an error embed to the webhook, with automatic formatting (just pass in data objects as seen in schema)',
};
