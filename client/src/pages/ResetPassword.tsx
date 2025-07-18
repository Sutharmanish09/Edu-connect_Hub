import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) {
      navigate('/login');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Reset Password</button>
        </form>
        <div style={styles.back}>
          <a href="/login" style={styles.backLink}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  body: {
    margin: 0,
    fontFamily: 'Segoe UI, sans-serif',
    background: '#0d0d0d',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  container: {
    backgroundColor: '#1a1a1a',
    padding: 40,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  },
  heading: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    border: 'none',
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#2b2b2b',
    color: '#fff',
  },
  button: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    background: '#5d5fef',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  back: {
    marginTop: 20,
    textAlign: 'center',
  },
  backLink: {
    color: '#aab6ff',
    textDecoration: 'none',
  },
};

export default ResetPassword;
