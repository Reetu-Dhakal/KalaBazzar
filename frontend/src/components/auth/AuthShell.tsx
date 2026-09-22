import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF3E2] px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}