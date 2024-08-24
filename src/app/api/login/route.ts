import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Make sure to install this package: npm install jsonwebtoken
import { getUser } from '../storage'; // Adjust the path according to your structure

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  try {
    // Validate user credentials
    const user = getUser(email);
    if (!user || user.password !== password) { 
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET_KEY as string, { expiresIn: '1h' });

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}