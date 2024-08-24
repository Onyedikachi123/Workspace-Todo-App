import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; 
import { addUser, getUser } from '../storage'; 

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  // Check if user already exists
  if (getUser(email)) {
    return NextResponse.json({ error: 'User already exists.' }, { status: 400 });
  }

  try {
    // Add user to in-memory storage
    const user = { id: Date.now().toString(), name, email, password };
    addUser(user);
    
    // Generate a JWT token
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET_KEY as string, { expiresIn: '1h' });

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
