import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from './env.mjs';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const APP_HASH = request.headers.get('APP_HASH');
  if (
    process.env.NODE_ENV !== 'development' &&
    (!APP_HASH || !env.APP_HASHES.includes(APP_HASH.toString()))
  )
    return NextResponse.json(
      {
        success: false,
        message: !APP_HASH ? 'Missing "auth" header' : 'Invalid APP_HASH',
      },
      {
        status: !APP_HASH ? 401 : 403,
      }
    );

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
};
