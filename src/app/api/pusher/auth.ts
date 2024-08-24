import { NextApiRequest, NextApiResponse } from 'next';
import Pusher from 'pusher';
import jwt from 'jsonwebtoken';

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
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);

    // Authenticate the user with Pusher
    const { socket_id, channel_name } = req.body;
    const auth = pusher.authenticate(socket_id, channel_name);

    res.status(200).json(auth);
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
}
