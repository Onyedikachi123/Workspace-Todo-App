import Pusher from 'pusher-js';

console.log("Pusher Key:", process.env.NEXT_PUBLIC_PUSHER_KEY);


export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true,
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PUSHER_AUTH_TOKEN}`,
    },
  },
});
