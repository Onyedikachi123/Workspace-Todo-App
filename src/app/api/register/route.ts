import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { addUser, getUser } from '../storage'; // Adjust the path as needed

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate the request body
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if the user already exists in the storage
    const existingUser = getUser(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }

    // Create a new user object
    const newUser = {
      id: uuidv4(), // Generate a unique ID for the user
      name,
      email,
      password, // Reminder: In a real application, passwords should be hashed before storage
    };

    // Add the new user to the storage
    addUser(newUser);

    // Generate a JWT token for the new user
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '1h' }
    );

    // Return the token and user information in the response
    return NextResponse.json({ token, user: newUser });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
