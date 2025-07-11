export const dynamic = 'force-static'; // No server-side computation
export const runtime = 'edge'; // Use edge runtime for minimal dependencies

export default function StaticPage() {
  return (
    <html>
      <head>
        <title>Static Test Page</title>
      </head>
      <body>
        <h1>Static Test Page</h1>
        <p>This is a completely static page with no dependencies.</p>
      </body>
    </html>
  );
}
