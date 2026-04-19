import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Fast session cookie check (no DB hit)
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return Response.json(
        { success: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request — detailed role/status checks happen in Server Components
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
