import { Button } from "@/components/ui/button";
import { Edit2, Settings } from "lucide-react";

interface ProfileActionsProps {
  onEdit: () => void;
  onSettings: () => void;
}

export function ProfileActions({ onEdit, onSettings }: ProfileActionsProps) {
  return (
    <div className="flex space-x-3">
      <Button 
        variant="secondary"
        size="sm"
        onClick={onEdit}
        className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <Edit2 className="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
      <Button 
        variant="secondary"
        size="sm"
        onClick={onSettings}
        className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>
    </div>
  );
} 