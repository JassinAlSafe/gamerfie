import { createSupabaseClient } from '@/utils/supabaseClient';
import toast from "react-hot-toast";

export function useAvatarUpload(userId: string) {
    const supabase = createSupabaseClient();
    
    const uploadAvatar = async (file: File) => {
        try {
            const fileExt = file.name.split(".").pop();
            const filePath = `${userId}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            toast.success("Avatar updated successfully!");
            return filePath;
        } catch (error) {
            toast.error("Failed to update avatar");
            throw error;
        }
    };

    return { uploadAvatar };
}

