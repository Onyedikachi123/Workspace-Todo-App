import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';


const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const { channel, event, data } = await req.json();
    await pusher.trigger(channel, event, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('Failed to trigger Pusher event', error)
    return NextResponse.json({ success: false, error: 'Failed to trigger Pusher event' }, { status: 500 });
  }
}
