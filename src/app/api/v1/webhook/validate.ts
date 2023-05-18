import { z } from 'zod';

const requireAtLeastOne = (val: { [key: string]: any }) =>
  !Object.values(val).every(x => x === undefined);

// Schemas
export const fileSchema = z.object({});

export const embedFooterSchema = z.object({
  text: z.string().max(2048),
  icon_url: z.string().optional(),
  proxy_icon_url: z.string().optional(),
});

export const embedImageSchema = z.object({
  url: z.string(),
  proxy_url: z.string().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

export const embedThumbnailSchema = embedImageSchema;

export const embedFieldSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

// provider, video, author

export const embedSchema = z
  .object({
    title: z.string().max(256).optional(),
    type: z
      .enum(['rich', 'image', 'video', 'gifv', 'article', 'link'])
      .optional(),
    description: z.string().max(4096).optional(),
    url: z.string().optional(),
    timestamp: z.date().optional(),
    color: z.number().optional(),
    footer: embedFooterSchema.optional(),
    image: embedImageSchema.optional(),
    thumbnail: embedThumbnailSchema.optional(),
    fields: z.array(embedFieldSchema).max(25).optional(),
  })
  .refine(requireAtLeastOne, {
    message:
      'At least one data property is required; title, description, url, timestamp, color, footer, image, thumbnail, fields',
  });

export const attachmentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  description: z.string().max(1024).optional(),
  content_type: z.string().optional(),
  size: z.number(),
  url: z.string(),
  proxy_url: z.string(),
  height: z.number().optional(),
  width: z.number().optional(),
});

export const webhookDataSchema = z.object({
  data: z
    .object({
      content: z.string().max(2000).optional(),
      files: z.array(fileSchema).optional(),
      embeds: z
        .array(embedSchema)
        .refine(x => x.length <= 10)
        .optional(),
    })
    .refine(requireAtLeastOne, {
      message: 'At least one data property is required; content, files, embeds',
    }),
  username: z.string().optional(),
  avatar_url: z.string().optional(),
  tts: z.boolean().optional(),
  payload_json: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  flags: z.number().optional(),
  thread_name: z.string().optional(),
});

export type IWebhookDataSchema = z.infer<typeof webhookDataSchema>;

export type IWebhookData =
  | Omit<IWebhookDataSchema, 'data'>
  | IWebhookDataSchema['data'];
