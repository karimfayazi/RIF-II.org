import { NextResponse } from "next/server";

// ✅ This API clears the auth cookie and redirects to login
export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));

  // Clear cookie
  response.cookies.set("auth", "", {
    httpOnly: true,
    expires: new Date(0), // immediately expire
    path: "/",
  });

  return response;
}
