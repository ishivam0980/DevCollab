export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/browse/:path*",
        "/profile/:path*",
        "/projects/:path*",
        "/my-projects/:path*",
        "/my-interests/:path*",
        "/notifications/:path*",
        "/users/:path*",
    ]
};
