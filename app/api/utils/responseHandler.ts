import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

export const responseHandler = {
  success: <T>(data: T, message?: string) => {
    return NextResponse.json({
      data,
      message
    });
  },

  error: (error: string, statusCode: number = 500, details?: any) => {
    return NextResponse.json(
      {
        error,
        details
      },
      { status: statusCode }
    );
  },

  created: <T>(data: T, message: string = 'Resource created successfully') => {
    return NextResponse.json(
      {
        data,
        message
      },
      { status: 201 }
    );
  }
}; 