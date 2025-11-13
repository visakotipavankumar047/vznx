'use client';

import { SignIn } from '@clerk/nextjs';

const clerkAppearance = {
  baseTheme: 'dark',
  colorScheme: 'dark',
  variables: {
    colorBackground: '#0f172a',
    colorSurface: '#0b1120',
    colorSurfaceRaised: '#0c1322',
    colorBorder: '#1f2937',
    colorInputBackground: '#1f2937',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorPrimary: '#6366f1',
    colorPrimaryText: '#f8fafc',
  },
  elements: {
    card: 'rounded-[26px] border border-white/10 bg-slate-950 shadow-[0_40px_80px_rgba(0,0,0,0.85)]',
    formButtonPrimary: 'rounded-[20px] bg-slate-900 text-white border border-white/10 shadow-[0_20px_40px_rgba(15,23,42,0.6)]',
    formFieldInput: 'rounded-xl border border-slate-800 bg-slate-900 text-white placeholder:text-slate-500',
  },
};

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-4 py-10">
      <div className="w-full max-w-md rounded-[32px] bg-white/0 p-0 shadow-2xl">
        <SignIn path="/auth" routing="path" appearance={clerkAppearance} />
      </div>
    </div>
  );
}
