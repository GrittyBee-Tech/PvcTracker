// lib/withDb.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';

type NextHandler = (request: Request, context: any) => Promise<Response> | Response;

export function withDb(handler: NextHandler): NextHandler {
  return async (request: Request, context: any) => {
    try {
      // Automatically handle database connection globally
      await connectDB();
      
      // Execute the actual route handler code
      return await handler(request, context);
    } catch (error: any) {
      console.error("Database connection or route error:", error);
      return NextResponse.json(
        { error: 'Internal Server Error' }, 
        { status: 500 }
      );
    }
  };
}