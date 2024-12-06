"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({
  userId,
  username,
  currentAvatarUrl,
  onAvatarUpdate,
}: AvatarUploadProps) {
  const supabase = createClientComponentClient();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (urlData) {
        const { publicUrl } = urlData;
        onAvatarUpdate(publicUrl);
        toast.success("Avatar updated successfully!");
      }
    } catch (error) {
      toast.error("Error uploading avatar!");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-32 h-32">
        <AvatarImage src={currentAvatarUrl || undefined} alt={username} />
        <AvatarFallback>
          <User className="w-16 h-16" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
          id="avatar-upload"
        />
        <label htmlFor="avatar-upload">
          <Button asChild variant="outline" disabled={uploading}>
            <span>{uploading ? "Uploading..." : "Change Avatar"}</span>
          </Button>
        </label>
      </div>
    </div>
  );
}
