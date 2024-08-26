interface User {
  id: string;
  name: string;
  email: string;
  password: string; 
}

interface Todo {
  id: number;
  text: string;
  status: boolean;
  creator: string;
  markedBy?: string;
}

const users: { [key: string]: User } = {}; 
const todos: { [key: string]: Todo[] } = {}; 

// Functions for managing users
export function getUser(email: string): User | undefined {
  return users[email];
}

export function addUser(user: User) {
  users[user.email] = user;
}

// Functions for managing todos
export function getUserTodos(email: string): Todo[] {
  return todos[email] || [];
}

export function addTodo(email: string, todo: Todo) {
  if (!todos[email]) {
    todos[email] = [];
  }
  todos[email].push(todo);
}

// Function to initialize default todos for a user
export function initializeDefaultTodos(email: string, defaultTodos: Todo[]) {
  if (!todos[email] || todos[email].length === 0) {
    todos[email] = defaultTodos;
  }
}
