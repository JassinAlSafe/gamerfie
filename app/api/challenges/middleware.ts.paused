import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function withAuth(handler: Function) {
  return async (request: Request, params?: any) => {
    try {
      console.log("withAuth middleware - Starting authentication check");
      
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        return NextResponse.json(
          { error: "Authentication failed", details: sessionError.message },
          { status: 401 }
        );
      }

      if (!session) {
        console.log("No session found");
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      console.log("Session found for user:", session.user.id);

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return NextResponse.json(
          { error: "Failed to fetch user profile", details: profileError.message },
          { status: 500 }
        );
      }

      if (!profile) {
        console.log("No profile found for user:", session.user.id);
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }

      console.log("Profile found for user:", session.user.id);

      return handler(request, params, { 
        supabase, 
        session,
        profile 
      });
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { 
          error: "Authentication error", 
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  };
}

export function withValidation<T>(schema: z.Schema<T>, handler: Function) {
  return withAuth(async (request: Request, params: any, context: any) => {
    try {
      console.log("withValidation middleware - Starting validation");
      
      const json = await request.clone().json();
      console.log("Request data:", json);
      
      const result = schema.safeParse(json);

      if (!result.success) {
        console.error("Validation error:", result.error);
        return NextResponse.json(
          {
            error: "Invalid request data",
            details: result.error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }

      console.log("Validation successful");
      return handler(request, params, result.data, context);
    } catch (error) {
      console.error("Validation middleware error:", error);
      return NextResponse.json(
        { 
          error: "Invalid JSON data", 
          details: error instanceof Error ? error.message : "Failed to parse request data"
        },
        { status: 400 }
      );
    }
  });
}

export async function withCreatorAuth(handler: Function) {
  return async (request: Request, { params }: { params: { id: string } }) => {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      // Check if user is the creator
      const { data: challenge, error: fetchError } = await supabase
        .from("challenges")
        .select("creator_id")
        .eq("id", params.id)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }

      if (challenge.creator_id !== session.user.id) {
        return NextResponse.json(
          { error: "Only the creator can perform this action" },
          { status: 403 }
        );
      }

      return handler(request, { params }, { supabase, session });
    } catch (error) {
      console.error("Creator auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export async function withParticipantAuth(handler: Function) {
  return async (request: Request, { params }: { params: { id: string } }) => {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      const { data: { session }, error: authError } = await supabase.auth.getSession();

      if (authError || !session) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }

      // Check if user is a participant
      const { data: participant, error: participantError } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", params.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (participantError) {
        return NextResponse.json(
          { error: "Failed to check participant status" },
          { status: 500 }
        );
      }

      if (!participant) {
        return NextResponse.json(
          { error: "Not a participant in this challenge" },
          { status: 403 }
        );
      }

      return handler(request, { params }, { supabase, session, participant });
    } catch (error) {
      console.error("Participant auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
} 