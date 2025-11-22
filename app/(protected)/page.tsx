'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col gap-4 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold text-center">Min side</h1>

      <Link
        href="/forms/new"
        className="w-full text-center px-4 py-6 rounded bg-black text-white text-lg active:opacity-90"
      >
        Opprett ny kontroll
      </Link>

      <Link
        href="/forms"
        className="w-full text-center px-4 py-6 rounded border text-lg bg-white active:bg-gray-50"
      >
        Mine kontroller
      </Link>
    </main>
  );
}
