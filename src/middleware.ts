import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import rateLimit from '~/utils/rate-limit';
import { NextApiResponse } from 'next';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export const middleware = async (req: NextRequest, res: NextApiResponse) => {
  const { isRateLimited, limit, remaining } = await limiter.check(
    res,
    3,
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
