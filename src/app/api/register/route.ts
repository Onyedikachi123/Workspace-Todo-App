import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { addUser, getUser } from '../storage'; 

// Define the number of salt rounds for bcrypt
const saltRounds = 10;

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

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword, // Store hashed password
    };

    // Add the new user to the storage
    addUser(newUser);

    // Generate a JWT token for the new user
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token, user: newUser });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
