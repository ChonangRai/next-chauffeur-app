"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateAdminProfile } from "@/lib/adminUtils";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function EditProfileModal({ open, onClose, initialProfile }: {
  open: boolean;
  onClose: () => void;
  initialProfile: Profile;
}) {
  const [firstName, setFirstName] = useState(initialProfile.firstName || "");
  const [lastName, setLastName] = useState(initialProfile.lastName || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    setSuccess(null);
    try {
      if (!firstName || !lastName || !phone) {
        setFormError("All fields are required");
        throw new Error("All fields are required");
      }
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setFormError("User not authenticated");
        throw new Error("User not authenticated");
      }
      await updateAdminProfile(userId, { firstName, lastName, phone });
      toast.success("Profile updated successfully");
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
          <Input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
          {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
} 
