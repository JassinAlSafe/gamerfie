"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FriendActivity } from "@/types/activity";
import { toast } from "react-hot-toast";

interface ActivityShareProps {
  activity: FriendActivity;
}

export function ActivityShare({ activity }: ActivityShareProps) {
  const handleShare = async (platform: string) => {
    const baseUrl = window.location.origin;
    const activityUrl = `${baseUrl}/game/${activity.game.id}`;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=Check out ${
          activity.game.name
        }&url=${encodeURIComponent(activityUrl)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          activityUrl
        )}`;
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(activityUrl);
          toast.success("Link copied to clipboard");
          return;
        } catch (error) {
          console.error("Failed to copy to clipboard:", error);
          toast.error("Failed to copy link");
          return;
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-green-400 gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("facebook")}>
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("copy")}>
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
