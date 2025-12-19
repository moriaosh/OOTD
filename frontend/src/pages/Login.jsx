import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔵 Starting login process...');
      const result = await login(email, password);
      console.log('🟢 Login successful!', result);
      console.log('🟢 Token saved:', !!localStorage.getItem('ootd_authToken'));
      console.log('🟢 User saved:', !!localStorage.getItem('ootd_currentUser'));
      
      // Force navigation
      console.log('🟢 Attempting navigation to /closet...');
      window.location.href = '/closet';
    } catch (err) {
      console.error('🔴 Login error:', err);
      setError(err.message || 'שגיאה בהתחברות');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="login-box" dir="rtl">
        <h2 className="login-title">כניסה למערכת</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">אימייל</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            autoComplete="email"
          />

          <label htmlFor="password">סיסמה</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {error && (
            <div className="message error" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'מתחבר...' : 'התחברות'}
          </button>

          <p className="helper-text">
            אין לך עדיין משתמש?{' '}
            <Link to="/register">לחצי כאן להרשמה</Link>
          </p>
        </form>
      </main>
    </Layout>
  );
};

export default Login;

