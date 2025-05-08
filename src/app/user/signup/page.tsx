"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@radix-ui/react-label";
import { Icons } from "@/components/ui/icons";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const logoURL = "/favicon.ico";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/user/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
        
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google signup error:", error);
      setError(error.message || "Google signup failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validate inputs
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // 1. First check if email exists
      const { data: existingUser, error: lookupError } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (existingUser) {
        setError("This email is already registered. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      // 2. Sign up through Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role: "customer",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // 3. Insert into users table
      if (authData.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: authData.user.email,
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role: "customer",
        });

        if (insertError) {
          if (insertError.code === "23505") {
            // Duplicate email error
            setError("This email is already registered. Please sign in instead.");
            setIsLoading(false);
            return;
          }
          throw insertError;
        }

        setSuccess("Registration successful! Please check your email to verify your account.");
        setTimeout(() => router.push("/user/signin"), 3000);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-muted flex flex-col items-center justify-center">
      <div className="absolute top-20 left-50 md:block hidden">
        <Link href={"/"} className="flex items-center justify-center">
          <Image src={logoURL} alt="" height={48} width={48} />
          <Label className="text-[32px] font-bold tracking-wide ml-4">
            <span className="text-[#1D3557]">London</span>
            <span className="text-[#DAA520]">Chauffeur</span>
            <span className="text-[#1D3557]">Hire</span>
          </Label>
        </Link>
      </div>
      <div className="md:hidden flex items-center justify-center mb-8">
        <Link href={"/"}>
          <Image src={logoURL} alt="" height={48} width={48} />
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
              {error}
              {error.includes("already registered")}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded text-sm">
              {success}
            </div>
          )}

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/user/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}