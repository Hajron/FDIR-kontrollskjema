import './globals.css';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <div className="max-w-5xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
