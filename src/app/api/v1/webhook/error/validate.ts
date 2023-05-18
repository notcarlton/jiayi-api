import { z } from 'zod';

export const postSchema = z.object({
  user: z
    .object({
      name: z.string(),
      discrim: z.string().length(4),
    })
    .optional(),
  main_error: z.object({
    error_name: z.string(),
    location: z.object({
      file_name: z.string(),
      line: z.number(),
    }),
  }),
  past_log: z.array(
    z.object({
      location: z.string(),
      level: z.enum(['Info', 'Error']),
      msg: z.string(),
    })
  ),
});

export type IPostSchema = z.infer<typeof postSchema>;
