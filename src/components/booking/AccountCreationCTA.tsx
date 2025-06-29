"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star } from "lucide-react";

export default function AccountCreationCTA() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  if (user) return null;

  return (
    <Card className="bg-yellow-50 border border-yellow-200 rounded-xl py-6 max-w-xs mx-auto">
      <CardHeader>
        <CardTitle className="text-yellow-900 text-xl font-bold mb-2">Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-yellow-900">Create a free account to:</p>
        <ul className="mb-6 space-y-2">
          <li className="flex items-center gap-2 text-yellow-900"><Star className="h-4 w-4 text-yellow-700" />View all your bookings in one place</li>
          <li className="flex items-center gap-2 text-yellow-900"><Star className="h-4 w-4 text-yellow-700" />Get booking updates and notifications</li>
          <li className="flex items-center gap-2 text-yellow-900"><Star className="h-4 w-4 text-yellow-700" />Quick rebooking for future trips</li>
          <li className="flex items-center gap-2 text-yellow-900"><Star className="h-4 w-4 text-yellow-700" />Access exclusive member benefits</li>
        </ul>
        <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold mb-2 rounded-md">
          <Link href="/user/signup">Create Account</Link>
        </Button>
        <Button asChild variant="outline" className="w-full rounded-md">
          <Link href="/user/signin">Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
} 