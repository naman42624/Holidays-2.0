export default function StandaloneAdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Admin Login - Holidays by Bells</title>
        <meta name="description" content="Admin portal login for Holidays by Bells" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
