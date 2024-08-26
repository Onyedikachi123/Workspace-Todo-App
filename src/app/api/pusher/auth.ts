import { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

// In-memory storage for session secrets (in a real application, use a database or secure storage)
const sessionSecrets: { [key: string]: string } = {};

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Function to generate a dynamic secret key for the session
function generateSessionSecret(): string {
  return require('crypto').randomBytes(64).toString('hex');
}

// Function to store the session secret temporarily
function storeSessionSecret(email: string, secret: string) {
  sessionSecrets[email] = secret;
}

// Function to get the stored session secret
function getSessionSecret(email: string): string | undefined {
  return sessionSecrets[email];
}

// Example: Store a session secret upon user login
export function onUserLogin(user: JwtPayload) {
  const sessionSecret = generateSessionSecret();
  storeSessionSecret(user.email, sessionSecret);
  
  // You can now generate a JWT with this session secret
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, sessionSecret, { expiresIn: '24h' });

  return token;
}

// Function to handle authentication and Pusher authorization
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Decode the token without verifying to extract user information
    const decoded = jwt.decode(token) as JwtPayload;

    // Retrieve the dynamic session secret key from in-memory storage
    const sessionSecret = getSessionSecret(decoded.email);
    if (!sessionSecret) {
      return res.status(403).json({ message: 'Invalid session or session expired' });
    }

    // Verify the JWT token with the dynamic session secret key
    jwt.verify(token, sessionSecret);

    // Authenticate the user with Pusher
    const { socket_id, channel_name } = req.body;
    const auth = pusher.authenticate(socket_id, channel_name, {
      user_id: decoded.id,
      user_info: {
        name: decoded.name,
        email: decoded.email,
      },
    });

    res.status(200).json(auth);
  } catch (error) {
    console.error('Pusher authentication error:', error);
    res.status(403).json({ message: 'Invalid token or Pusher authentication failed' });
  }
}

