import React, {useState} from 'react';
export default function Login({onLoginSuccess}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try{
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, password }),
            });
        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            localStorage.setItem('token',data.token);
            onLoginSuccess();

        } else {
            setError(data.message);
        }
        }
        catch (error) {
            setError('An error occurred during login');
        }

    };

  return (
    <div className="bg-[#111827] border border-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-indigo-400 mb-6">User Login</h2>
      
      {error && (
        <p className="bg-red-950/40 border border-red-900 text-red-400 p-2 rounded mb-4 text-sm text-center">
          {error}
        </p>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="text" name="fake-username" style={{ display: 'none' }} />
            <input type="password" name="fake-password" style={{ display: 'none' }} />
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
            placeholder="Enter admin username"
            required
            autoComplete="one-time-code"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1f2937] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" 
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition duration-150 mt-2">
          Login
        </button>
      </form>
    </div>
  );
}