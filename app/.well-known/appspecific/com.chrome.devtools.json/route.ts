import { NextResponse } from 'next/server';

export async function GET() {
  // Return a minimal response to prevent 404 errors from Chrome DevTools
  return NextResponse.json({ devtools: false });
}