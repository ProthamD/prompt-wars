export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/coach/:path*", "/add/:path*", "/receipt/:path*"],
};
