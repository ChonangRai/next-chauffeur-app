// app/user/confirm-signup/page.tsx
import { Suspense } from 'react';
import ConfirmSignupClient from './ConfirmSignupClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Verification',
};

export default function ConfirmSignupPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = Array.isArray(searchParams.token) 
    ? searchParams.token[0] 
    : searchParams.token;

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