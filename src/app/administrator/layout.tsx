"use client";
import { useState } from "react";
import AdminNavBar from "@/components/admin/AdminNavBar";
import AdminSidebarContent from "@/components/admin/AdminSidebarContent";
import AddAdminModal from "@/components/admin/AddAdminModal";
import ChangePasswordModal from "@/components/admin/ChangePasswordModal";
import EditProfileModal from "@/components/admin/EditProfileModal";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/administrator/signin" || pathname === "/administrator/forgot-password";

  if (isAuthPage) {
    return <>{children}</>;
  }

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminLayoutInner
        showAddAdmin={showAddAdmin}
        setShowAddAdmin={setShowAddAdmin}
        showChangePassword={showChangePassword}
        setShowChangePassword={setShowChangePassword}
        showEditProfile={showEditProfile}
        setShowEditProfile={setShowEditProfile}
      >
        {children}
      </AdminLayoutInner>
    </SidebarProvider>
  );
}

function AdminLayoutInner({
  children,
  showAddAdmin,
  setShowAddAdmin,
  showChangePassword,
  setShowChangePassword,
  showEditProfile,
  setShowEditProfile,
}: any) {
  const { state } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar collapsible="icon">
        <AdminSidebarContent />
      </Sidebar>
      <div
        className={
          state === "collapsed"
            ? "flex-1 transition-all duration-200 pl-[--sidebar-width-icon]"
            : "flex-1 transition-all duration-200 pl-[--sidebar-width]"
        }
      >
        <AdminNavBar
          onAddAdmin={() => setShowAddAdmin(true)}
          onChangePassword={() => setShowChangePassword(true)}
          onEditProfile={() => setShowEditProfile(true)}
        />
        <main className="container mx-auto p-4">
          {children}
        </main>
      </div>
      <AddAdminModal open={showAddAdmin} onClose={() => setShowAddAdmin(false)} />
      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        initialProfile={{ firstName: "", lastName: "", phone: "" }}
      />
    </div>
  );
} 
