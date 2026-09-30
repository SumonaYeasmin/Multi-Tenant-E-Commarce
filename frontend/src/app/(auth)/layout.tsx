import React from 'react';

export default function AuthLayoutGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      {children}
    </div>
  );
}
