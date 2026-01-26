'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect on client side
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
  }, [router]);

  // Return a loading state instead of null to avoid hydration issues
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
