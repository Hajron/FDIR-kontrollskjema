import React from 'react';
import { requireUser } from '@/lib/auth';
import Header from '@/components/Header';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <Header />
      {children}
    </>
  );
}
