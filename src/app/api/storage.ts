interface User {
    id: string;
    name: string;
    email: string;
    password: string; // In a real app, never store plain passwords
  }
  
  const users: { [key: string]: User } = {};
  
  export function addUser(user: User) {
    users[user.email] = user;
  }
  
  export function getUser(email: string) {
    return users[email];
  }