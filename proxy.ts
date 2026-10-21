import { NextResponse, type NextRequest } from "next/server";
import { routableExperience, routableProjects } from "@/lib/content";

/*
 * Detail pages stream, and a streamed response is already 200 by the time the
 * page could call notFound(). This check runs first, so unknown, hidden and (in
 * production) draft slugs get a real 404 instead of a 404 page with status 200.
 * Same publishing rule as the pages: lib/content.ts isRoutable().
 */
const allowed = {
  projects: new Set(routableProjects().map((p) => p.slug)),
  experience: new Set(routableExperience().map((e) => e.slug)),
};

export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/") as [string, keyof typeof allowed, string];
  if (allowed[section]?.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  matcher: ["/projects/:slug", "/experience/:slug"],
};
