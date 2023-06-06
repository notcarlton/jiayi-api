import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import rateLimit from '~/utils/rate-limit';
import { NextApiResponse } from 'next';
import { env } from './env.mjs';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

// Order matters
const LIMITS = {
  '/api/webhook': 2,
  '/api/minecraft': 15,
};

export const middleware = async (req: NextRequest, res: NextApiResponse) => {
  // TODO: Make sure this doesnt break
  if (env.NODE_ENV === 'development') return NextResponse.next();

  let LIMIT = 10;

  Object.keys(LIMITS).forEach(path => {
    if (req.nextUrl.pathname.startsWith(path))
      LIMIT = LIMITS[path as keyof typeof LIMITS];
  });

  const { isRateLimited, limit, remaining } = await limiter.check(
    res,
    LIMIT,
    'CACHE_TOKEN'
  );

  if (isRateLimited) {
    const responseHeaders = new Headers();

    responseHeaders.set('X-RateLimit-Limit', limit.toString());
    responseHeaders.set('X-RateLimit-Remaining', remaining.toString());

    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: responseHeaders }
    );
  }

  NextResponse.next();
};

export const config = {
  matcher: '/api/:path*',
};
