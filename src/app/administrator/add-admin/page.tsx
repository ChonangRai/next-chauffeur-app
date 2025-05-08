"use client";
import React from "react";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../../../components/ui/button"
import {Input} from "../../../components/ui/input"
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      const { error: insertError } = await supabase
        .from("admins")
        .insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
        });
      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess("Admin registered successfully! Check your email for confirmation.");
        setTimeout(() => {
          router.push("/administrator/signin");
        }, 2000); // Redirect after 2 seconds
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Sign Up</h2>
        <form onSubmit={handleAdminSignUp} className="space-y-4">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
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
          <Button type="submit" className="w-full">Sign Up</Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}
          <p className="text-center">
            Already have an account?{" "}
            <a href="/admin/signin" className="text-blue-500 hover:underline">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}