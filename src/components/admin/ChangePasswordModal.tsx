"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length < minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter";
    if (!hasNumbers) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setSuccess(null);
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        setFormError("Not authenticated. Please sign in again.");
        router.push("/administrator/signin");
        return;
      }
      if (newPassword !== confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }
      if (newPassword === currentPassword) {
        setFormError("New password must be different from current password");
        return;
      }
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setFormError(passwordError);
        return;
      }
      // Re-authenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      // Update Firestore fields
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        lastPasswordChanged: new Date().toISOString(),
        mustChangePassword: false,
      });
      setSuccess("Password changed successfully!");
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (error: any) {
      setFormError(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowCurrent(v => !v)}
            >
              {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowNew(v => !v)}
            >
              {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowConfirm(v => !v)}
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Changing..." : "Change Password"}
          </Button>
          {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
} 