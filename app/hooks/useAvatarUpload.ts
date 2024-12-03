import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

export function useAvatarUpload(userId: string) {
    const supabase = createClientComponentClient();
    const queryClient = useQueryClient();

    return useMutation(
        async (file: File) => {
            const fileExt = file.name.split(".").pop();
            const filePath = `${userId}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            return filePath;
        },
        {
            onSuccess: (filePath) => {
                queryClient.setQueryData(['profile'], (oldData: any) => ({
                    ...oldData,
                    avatar_url: filePath,
                }));
                toast.success("Avatar updated successfully!");
            },
            onError: () => {
                toast.error("Failed to update avatar");
            },
        }
    );
}

