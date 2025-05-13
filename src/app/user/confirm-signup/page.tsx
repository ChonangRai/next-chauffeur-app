import { Suspense } from "react";
import ConfirmSignupClient from "./ConfirmSignupClient";
import type { Metadata } from "next";

// Define metadata
export const metadata: Metadata = {
  title: "Email Verification",
};

// Define the props type for the page with unknown instead of any
type ConfirmSignupPageProps = {
  searchParams: Promise<unknown> | undefined;
};

export default async function ConfirmSignupPage({
  searchParams,
}: ConfirmSignupPageProps) {
  // Await searchParams and assert the expected shape
  const resolvedSearchParams = await (searchParams as Promise<{ [key: string]: string | string[] | undefined }>);
  const token = Array.isArray(resolvedSearchParams?.token) ? resolvedSearchParams.token[0] : resolvedSearchParams?.token;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConfirmSignupClient token={token} />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600" />
    </div>
  );
}