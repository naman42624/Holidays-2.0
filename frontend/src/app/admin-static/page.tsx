export const dynamic = 'force-static'; // No server-side computation
export const runtime = 'edge'; // Use edge runtime for minimal dependencies

export default function AdminLogin() {
  return (
    <html>
      <head>
        <title>Admin Login</title>
        <style>{`
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .login-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
          }
          h1 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1.5rem;
            text-align: center;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }
          button {
            width: 100%;
            padding: 0.75rem;
            background-color: #0070f3;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            margin-top: 1rem;
          }
          button:hover {
            background-color: #0060df;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="login-card">
            <h1>Admin Login</h1>
            <form onSubmit={(e) => {
              e.preventDefault();
              const email = (document.getElementById('email') as HTMLInputElement).value;
              const password = (document.getElementById('password') as HTMLInputElement).value;
              
              fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  // Save token and user data
                  localStorage.setItem('authToken', data.data.token);
                  localStorage.setItem('user', JSON.stringify(data.data.user));
                  
                  // Check if user has admin role
                  const user = data.data.user;
                  if (['admin', 'super-admin', 'website-editor'].includes(user.role)) {
                    window.location.href = '/admin/dashboard';
                  } else {
                    alert('You do not have permission to access the admin portal');
                  }
                } else {
                  alert(data.message || 'Login failed');
                }
              })
              .catch(error => {
                alert('Login failed: ' + error.message);
              });
            }}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  defaultValue="admin@example.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </body>
    </html>
  );
}
