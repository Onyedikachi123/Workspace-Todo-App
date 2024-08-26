import { NextRequest, NextResponse } from 'next/server';
import { getUserTodos, initializeDefaultTodos } from '../storage'; // Import initialization function
import jwt, { JwtPayload } from 'jsonwebtoken'; // Import jsonwebtoken

interface Todo {
  id: number;
  text: string;
  status: boolean;
  creator: string;
  markedBy?: string;
}

// Initialize default to-dos
const defaultTodos: Todo[] = [
  { id: 1, text: "Buy groceries", status: false, creator: "user@example.com" },
  { id: 2, text: "Walk the dog", status: false, creator: "user@example.com" },
  { id: 3, text: "Read a book", status: false, creator: "user@example.com" },
  { id: 4, text: "Write a blog post", status: false, creator: "user@example.com" },
];

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]; 
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;
    let todos = getUserTodos(user.email); 

    // Initialize default todos if none exist
    if (todos.length === 0) {
      initializeDefaultTodos(user.email, defaultTodos); 
      todos = getUserTodos(user.email); 
    }

    return NextResponse.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
