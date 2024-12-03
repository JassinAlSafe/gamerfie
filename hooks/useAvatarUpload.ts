import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

const useAvatarUpload = (userId: string, currentAvatarUrl: string | null) => {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClientComponentClient();

  const uploadAvatar = async (file: File) => {
    try {
      setIsUploading(true);
      
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      await deleteOldAvatar();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteOldAvatar = async () => {
    if (currentAvatarUrl) {
      const fileName = currentAvatarUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("avatars").remove([fileName]);
      }
    }
  };

  const removeAvatar = async () => {
    try {
      setIsUploading(true);
      await deleteOldAvatar();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, removeAvatar, isUploading };
};

export default useAvatarUpload;