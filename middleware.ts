import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/protected(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Agora com await!
  const authData = await auth();
  if (isProtectedRoute(req) && !authData.userId) {
    return Response.redirect(new URL("/sign-in", req.url));
  }
  // Senão, segue normalmente
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
