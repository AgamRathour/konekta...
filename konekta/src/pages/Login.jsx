import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userStorage } from '../utils/localStorage';

const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const Login = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Konekta | Log-In';
    // Check if already logged in
    if (userStorage.getCurrentUser()) {
      navigate('/feed');
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formValues.email || !formValues.password) {
      return setError('Please fill in both email and password.');
    }
    if (!isValidEmail(formValues.email)) {
      return setError('Please enter a valid email address.');
    }

    try {
      setLoading(true);
      
      // Find user by email
      const user = userStorage.findUserByEmail(formValues.email);
      
      if (!user) {
        return setError('No account found with this email address.');
      }

      // Verify password (in production, use hashed passwords)
      if (user.password !== formValues.password) {
        return setError('Incorrect password. Please try again.');
      }

      // Set current user
      userStorage.setCurrentUser(user.id);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 animate-fade-in">
      <main className="w-full max-w-md glass-panel p-8 animate-scale-in">
        <h1 className="text-center text-4xl font-poppins font-bold mb-8 text-gradient animate-slide-down">
          Log-In
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="email" className="block text-sm font-semibold text-brand-pink mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={formValues.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password" className="block text-sm font-semibold text-brand-pink mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formValues.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl px-4 py-3 text-sm text-red-400 animate-slide-down">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-neon w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin" />
                Logging in...
              </span>
            ) : (
              'Log-In'
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6 text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <span className="flex-1 border-t border-[#1f1f1f]" />
          OR
          <span className="flex-1 border-t border-[#1f1f1f]" />
        </div>

        <div
          id="g_id_onload"
          data-client_id="1050991664471-o53bq2g0vqjrfeui9jigrv87tobck04g.apps.googleusercontent.com"
          data-login_uri="http://localhost:3000"
          data-auto_prompt="false"
          data-itp_support="true"
        />
        <div
          className="g_id_signin animate-fade-in"
          data-type="standard"
          data-theme="filled_black"
          data-size="large"
          data-shape="rectangular"
          data-logo_alignment="left"
          style={{ width: '100%', animationDelay: '0.5s' }}
        />

        <p className="text-sm text-gray-400 text-center mt-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-brand-pink font-semibold hover:text-brand-cyan transition-colors">
            Create one
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Login;


