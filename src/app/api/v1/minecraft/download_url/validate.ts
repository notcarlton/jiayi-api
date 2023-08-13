import { z } from 'zod';

import { extendApi as v } from '@anatine/zod-openapi';

const versionArchSchema = z.object({
  version: z.string().regex(/^(\d+\.){3}(\d+)$/),
  arch: z.enum(['x64', 'x86', 'arm']),
});

const updateIDSchema = z.object({
  update_id: z
    .string()
    .regex(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
    )
    .length(36),
});

const defaultsSchema = z.object({
  redirect: z
    .string()
    .optional()
    .refine(x => x === 'true' || x === '1'),
});

export const schema = v(
  versionArchSchema
    .merge(updateIDSchema)
    .merge(defaultsSchema)
    .partial()
    .refine(
      data => (data.arch && data.version) || data.update_id,
      'Invalid params (version & arch OR update_id)'
    ),
  {
    title: 'Schema',
  }
);

export type ISchema = z.infer<typeof schema>;

export const schema_string = `version & arch OR update_id`;
