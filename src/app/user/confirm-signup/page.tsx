// app/user/confirm-signup/page.tsx
import { Suspense } from 'react';
import ConfirmSignupClient from './ConfirmSignupClient';

export default function ConfirmSignup({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ConfirmSignupClient token={searchParams.token} />
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