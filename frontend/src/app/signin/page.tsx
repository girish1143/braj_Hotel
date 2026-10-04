'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SignInRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.replace('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-serif text-amber-600 animate-bounce">🕉️</div>
        <p className="text-xs text-neutral-500 font-bold mt-2">Connecting to Sacred Access...</p>
      </div>
    </div>
  );
}

export default function SignInRedirectPage() {
  return (
    <Suspense fallback={null}>
      <SignInRedirectContent />
    </Suspense>
  );
}
