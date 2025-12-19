import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      navigate('/closet');
    } catch (err) {
      setError(err.message || 'שגיאה בהרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="login-box register-box" dir="rtl">
        <h2 className="login-title">יצירת משתמש חדש</h2>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="form-group">
              <label htmlFor="firstName">שם פרטי</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="לדוגמה: שירה"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">שם משפחה</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="לדוגמה: איטח"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">אימייל</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="בחרי סיסמה"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">אימות סיסמה</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="הקלידי שוב את הסיסמה"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="message error" style={{ display: 'block' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'נרשם...' : 'יצירת משתמש חדש'}
          </button>

          <p className="helper-text">
            כבר יש לך משתמש?{' '}
            <Link to="/login">מעבר להתחברות</Link>
          </p>
        </form>
      </main>
    </Layout>
  );
};

export default Register;

