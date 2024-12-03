"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Upload, X } from "lucide-react";
import useAvatarUpload from "@/hooks/useAvatarUpload";
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
  const { uploadAvatar, removeAvatar, isUploading } = useAvatarUpload(
    userId,
    currentAvatarUrl
  );

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadAvatar(file);
      if (publicUrl) {
        onAvatarUpdate(publicUrl);
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update avatar");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      onAvatarUpdate("");
      toast.success("Avatar removed successfully");
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast.error("Failed to remove avatar");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={currentAvatarUrl || undefined} alt={username} />
          <AvatarFallback className="text-2xl">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Icons.spinner className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="relative"
          disabled={isUploading}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            accept="image/*"
            disabled={isUploading}
          />
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        {currentAvatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
