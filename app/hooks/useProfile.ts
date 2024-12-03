import { useQuery } from 'react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export interface Profile {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    updated_at?: string;
}

/**
 * Fetch the user profile from Supabase
 */
const fetchProfile = async (userId: string | null): Promise<Profile | null> => {
    if (!userId) throw new Error("User ID is required to fetch the profile");

    const supabase = createClientComponentClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile");
        return null;
    }

    return data;
};

/**
 * Custom hook to fetch and manage the user profile
 */
export const useProfile = (userId: string | null) => {
    return useQuery<Profile | null>(
        ["profile", userId],
        () => fetchProfile(userId),
        {
            enabled: !!userId, // Only fetch if userId is provided
            staleTime: 1000 * 60 * 5, // Cache profile data for 5 minutes
            onError: (error: any) => {
                console.error("Error fetching profile:", error);
                toast.error("Failed to fetch profile");
            },
        }
    );
};