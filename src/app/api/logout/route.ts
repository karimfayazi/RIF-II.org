import { NextResponse } from "next/server";

export async function POST() {
	const response = NextResponse.json({ success: true });
	response.cookies.set({
		name: "auth",
		value: "",
		path: "/",
		maxAge: 0,
		httpOnly: false, // Allow JavaScript to read the cookie
		secure: process.env.NODE_ENV === "production", // Only secure in production
		sameSite: "lax",
	});
	return response;
}


