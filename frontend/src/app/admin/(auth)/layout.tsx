'use client';

// This is a standalone layout for auth routes that doesn't inherit the admin layout
// It avoids the authentication checks that could cause redirect loops
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
