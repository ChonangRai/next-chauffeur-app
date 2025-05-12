// app/user/confirm-signup/ConfirmSignupClient.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import AuthLayout from "../../../components/auth/AuthLayout";
import Logo from "../../../components/auth/Logo";
import { Check, AlertCircle, Loader2, Link } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ConfirmSignupClient({ token }: { token?: string }) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const confirmSignup = async () => {
            if (!token) {
                setStatus("error");
                setMessage("No verification token found. Please use the link sent to your email.");
                return;
            }

            try {
                const { error } = await supabase.auth.verifyOtp({
                    type: "email",
                    token_hash: token,
                });

                if (error) {
                    setStatus("error");
                    setMessage(error.message || "Invalid or expired verification link.");
                } else {
                    setStatus("success");
                    setMessage("Your email has been successfully verified!");
                    await supabase.auth.refreshSession();
                }
            } catch (error) {
                console.log(error)
                setStatus("error");
                setMessage("An error occurred while verifying your email.");
            }
        };

        confirmSignup();
    }, [token]);

    const handleContinue = () => {
        router.push("/user/signin");
    };

    return (
        <AuthLayout title="Email Verification" subtitle="Confirming your email address">
            <div className="flex flex-col items-center justify-center py-6">
                <Logo className="mb-8" />

                {status === "loading" && (
                    <div className="text-center">
                        <div className="flex justify-center">
                            <span className="relative flex h-16 w-16">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-25"></span>
                                <Loader2 className="relative h-16 w-16 animate-spin text-brand-600" />
                            </span>
                        </div>
                        <p className="text-gray-700 mt-6 text-lg">Verifying your email address...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center space-y-6 w-full">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-100 p-4 inline-flex">
                                <Check className="h-10 w-10 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Verification Successful!</h2>
                        <Alert className="bg-green-50 border-green-200 text-green-800">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                        <div className="space-y-3 pt-2">
                            <Button className="w-full" size="lg" onClick={handleContinue}>
                                Sign In to Your Account
                            </Button>
                            <p className="text-sm text-gray-500">Welcome to our community! You can now access all features.</p>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center space-y-6 w-full">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-red-100 p-4 inline-flex">
                                <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Verification Failed</h2>
                        <Alert className="bg-red-50 border-red-200 text-red-800">
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                        <div className="flex flex-col space-y-3 pt-2">
                            <Button asChild variant="outline" size="lg">
                                <Link href="/user/signup">Back to Sign Up</Link>
                            </Button>
                            <Button asChild variant="ghost" className="text-sm">
                                <Link href="/">Go to Homepage</Link>
                            </Button>
                            <p className="text-sm text-gray-500 pt-2">Need help? Contact our support team.</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}