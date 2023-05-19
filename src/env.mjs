import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DISCORD_WEBHOOK: z
      .string()
      .regex(/https:\/\/discord.com\/api\/webhooks\/\d+\/.+/),
    APP_HASHES: z.string().transform(x => x.split(',')),
  },
  client: {},
  runtimeEnv: {
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
    APP_HASHES: process.env.APP_HASHES,
  },
});
