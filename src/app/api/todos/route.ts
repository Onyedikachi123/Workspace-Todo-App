import { NextResponse } from 'next/server';

interface Todo {
  id: number;
  text: string;
  status: boolean;
  creator: string;
  markedBy?: string;
}

// Simulate a static list of todos
const todos: Todo[] = [
  { id: 1, text: 'Learn Next.js', status: false, creator: 'John Doe' },
  { id: 2, text: 'Build a todo app', status: true, creator: 'Jane Doe', markedBy: 'Jane Doe' },
  { id: 3, text: 'Write documentation', status: false, creator: 'John Doe' }, // New Todo
  { id: 4, text: 'Deploy the app', status: false, creator: 'Jane Doe' }    // New Todo
];

export async function GET() {
  // Simulate fetching todos for the authenticated user
  return NextResponse.json({ todos });
}
