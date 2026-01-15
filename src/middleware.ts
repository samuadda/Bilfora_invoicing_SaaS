import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Rate Limiter
// Note: Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds per IP
    analytics: true,
    prefix: "@upstash/ratelimit",
});

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Rate Limiting Logic
    // Only apply to API routes and Auth endpoints to prevent abuse
    // Skip for static assets and Next.js internals handled by matcher, but being explicit helps
    if (request.nextUrl.pathname.startsWith("/api") || request.nextUrl.pathname.startsWith("/auth")) {
        const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
        // Fail open if Redis is not configured to avoid blocking legitimate users during setup
        try {
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return new NextResponse("Too Many Requests", { status: 429 });
            }
        } catch (error) {
            console.error("Rate limit error:", error);
            // Continue if rate limiting fails (fail open)
        }
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/api/:path*", // Include API routes for rate limiting
        "/auth/:path*", // Include Auth routes if they exist
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
