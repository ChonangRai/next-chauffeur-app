"use client";
import React from "react";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("id", user?.id)
        .single();
      if (admin) {
        router.push("/administrator/dashboard");
      } else {
        await supabase.auth.signOut();
        setError("Access denied. You are not an admin.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">Sign In</Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <p className="text-center">
            Don’t have an account?{" "}
            <a href="/administrator/add-admin" className="text-blue-500 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}