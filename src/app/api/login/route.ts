import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Use bcryptjs for password hashing
import { getUser } from '../storage';
import { onUserLogin } from '../../utils/auth'; // Ensure this utility function exists and works correctly

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = getUser(email);

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Compare the hashed password with the provided password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = onUserLogin({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed due to server error.' },
      { status: 500 }
    );
  }
}
