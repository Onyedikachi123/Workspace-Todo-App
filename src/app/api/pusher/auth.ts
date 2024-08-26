import { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import jwt from 'jsonwebtoken';

// Define an interface for the JWT payload
interface JwtPayload {
  id: string;
  name: string;
  email: string;
}

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1]; // Get the token from the Authorization header
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    // Verify the JWT token and cast the result to JwtPayload
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;

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
