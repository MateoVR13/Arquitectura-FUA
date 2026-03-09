import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/', '/_next', '/favicon.ico', '/api/auth/login', '/api/auth/register'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // allow public paths
    if (publicPaths.some(p => pathname.startsWith(p) || pathname === p)) {
        return NextResponse.next();
    }

    // verify session for other routes
    const session = request.cookies.get('session')?.value;
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const parsed = await decrypt(session);
    if (!parsed) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
