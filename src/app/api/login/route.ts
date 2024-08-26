import { NextResponse } from "next/server";
import { getUser } from "../storage";
import { onUserLogin } from "../../utils/auth"; 

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = getUser(email);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = onUserLogin({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    console.log("Generated JWT Token:", token);

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed due to server error." },
      { status: 500 }
    );
  }
}
