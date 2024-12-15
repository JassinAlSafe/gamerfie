import { User, Settings, Heart, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileDropdownProps {
  user: any;
  onSignOut: () => void;
}

export function ProfileDropdown({ user, onSignOut }: ProfileDropdownProps) {
  const router = useRouter();
  const userInitial = user?.user_metadata?.name?.[0] || user?.email?.[0] || "U";
  const displayName = user?.user_metadata?.name || user?.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
            <AvatarFallback className="bg-purple-600 text-white">
              {userInitial.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 shadow-2xl mt-2"
        align="end"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700/50" />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="flex items-center py-2 cursor-pointer text-gray-200 hover:text-white focus:text-white hover:bg-white/10 focus:bg-white/10"
            onClick={() => router.push('/profile')}
          >
            <User className="mr-3 h-4 w-4" />
            <span>Your Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center py-2 cursor-pointer text-gray-200 hover:text-white focus:text-white hover:bg-white/10 focus:bg-white/10"
            onClick={() => router.push('/settings')}
          >
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center py-2 cursor-pointer text-gray-200 hover:text-white focus:text-white hover:bg-white/10 focus:bg-white/10"
            onClick={() => router.push('/profile/games')}
          >
            <Heart className="mr-3 h-4 w-4" />
            <span>Your Games</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-700/50" />
        <DropdownMenuItem 
          className="flex items-center py-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-white/10 focus:bg-white/10"
          onClick={onSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 