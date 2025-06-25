"use client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { LogOut, User, Key, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminNavBar({ onAddAdmin, onChangePassword, onEditProfile }: {
  onAddAdmin: () => void;
  onChangePassword: () => void;
  onEditProfile: () => void;
}) {
  const router = useRouter();
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/administrator/signin");
  };

  return (
    <nav className="w-full bg-white border-b flex items-center justify-between px-4 py-2 shadow-sm z-30">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="mr-2" />
        <Button variant="outline" size="sm" onClick={onAddAdmin} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Admin
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src="/images/user-avatar.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin Menu</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEditProfile}>
            <User className="w-4 h-4 mr-2" /> Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onChangePassword}>
            <Key className="w-4 h-4 mr-2" /> Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
} 
