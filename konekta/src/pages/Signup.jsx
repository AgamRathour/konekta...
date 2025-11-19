import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userStorage } from '../utils/localStorage';

const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const isValidUsername = (username) => {
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
};

const Signup = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    username: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.title = 'Konekta | Sign Up';
    // Check if already logged in
    if (userStorage.getCurrentUser()) {
      navigate('/feed');
    }
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError('');
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Real-time validation
    if (name === 'email' && value && !isValidEmail(value)) {
      setValidationErrors((prev) => ({ ...prev, email: 'Invalid email format' }));
    }
    if (name === 'username' && value && !isValidUsername(value)) {
      setValidationErrors((prev) => ({ ...prev, username: 'Username must be 3-20 characters (letters, numbers, underscores only)' }));
    }
    if (name === 'password' && value && !isStrongPassword(value)) {
      setValidationErrors((prev) => ({ ...prev, password: 'Password must be 8+ chars with uppercase, lowercase, number, and special character' }));
    }
    if (name === 'confirmPassword' && value && value !== formValues.password) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formValues.email || !formValues.password || !formValues.username) {
      return setError('Please fill in all required fields.');
    }
    if (!isValidUsername(formValues.username)) {
      return setError('Username must be 3-20 characters and contain only letters, numbers, and underscores.');
    }
    if (!isValidEmail(formValues.email)) {
      return setError('Please enter a valid email address.');
    }
    if (!isStrongPassword(formValues.password)) {
      return setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
    }
    if (formValues.password !== formValues.confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      
      // Check if email already exists
      const existingUser = userStorage.findUserByEmail(formValues.email);
      if (existingUser) {
        return setError('An account with this email already exists.');
      }

      // Check if username already exists
      const users = userStorage.getUsers();
      const usernameExists = users.some(u => u.username.toLowerCase() === formValues.username.toLowerCase());
      if (usernameExists) {
        return setError('This username is already taken. Please choose another.');
      }

      // Create new user
      const newUser = userStorage.saveUser({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password, // In production, hash this
      });

      // After successful signup, redirect to login
      alert('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 animate-fade-in">
      <main className="w-full max-w-md glass-panel p-8 animate-scale-in">
        <h1 className="text-center text-4xl font-poppins font-bold mb-8 text-gradient animate-slide-down">
          Sign Up
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="username" className="block text-sm font-semibold text-brand-pink mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="johndoe"
              value={formValues.username}
              onChange={handleChange}
              className={`input-field ${validationErrors.username ? 'border-red-500' : ''}`}
              minLength={3}
              maxLength={20}
            />
            {validationErrors.username && (
              <p className="text-xs text-red-400 mt-1 animate-slide-down">{validationErrors.username}</p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
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
              className={`input-field ${validationErrors.email ? 'border-red-500' : ''}`}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-400 mt-1 animate-slide-down">{validationErrors.email}</p>
            )}
            {formValues.email && isValidEmail(formValues.email) && (
              <p className="text-xs text-green-400 mt-1 animate-slide-down">
                <i className="fa-regular fa-circle-check mr-1" />
                Valid email format
              </p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="password" className="block text-sm font-semibold text-brand-pink mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formValues.password}
                onChange={handleChange}
                className={`input-field pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <i className={`fa-regular fa-${showPassword ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>
            {formValues.password && (
              <div className="mt-2">
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Strength: {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                </p>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <p className={formValues.password.length >= 8 ? 'text-green-400' : ''}>
                    <i className={`fa-regular fa-${formValues.password.length >= 8 ? 'circle-check' : 'circle'} mr-1`} />
                    At least 8 characters
                  </p>
                  <p className={/[a-z]/.test(formValues.password) ? 'text-green-400' : ''}>
                    <i className={`fa-regular fa-${/[a-z]/.test(formValues.password) ? 'circle-check' : 'circle'} mr-1`} />
                    Lowercase letter
                  </p>
                  <p className={/[A-Z]/.test(formValues.password) ? 'text-green-400' : ''}>
                    <i className={`fa-regular fa-${/[A-Z]/.test(formValues.password) ? 'circle-check' : 'circle'} mr-1`} />
                    Uppercase letter
                  </p>
                  <p className={/[0-9]/.test(formValues.password) ? 'text-green-400' : ''}>
                    <i className={`fa-regular fa-${/[0-9]/.test(formValues.password) ? 'circle-check' : 'circle'} mr-1`} />
                    Number
                  </p>
                  <p className={/[^A-Za-z0-9]/.test(formValues.password) ? 'text-green-400' : ''}>
                    <i className={`fa-regular fa-${/[^A-Za-z0-9]/.test(formValues.password) ? 'circle-check' : 'circle'} mr-1`} />
                    Special character
                  </p>
                </div>
              </div>
            )}
            {validationErrors.password && (
              <p className="text-xs text-red-400 mt-1 animate-slide-down">{validationErrors.password}</p>
            )}
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-brand-pink mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formValues.confirmPassword}
                onChange={handleChange}
                className={`input-field pr-10 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <i className={`fa-regular fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>
            {formValues.confirmPassword && formValues.password === formValues.confirmPassword && (
              <p className="text-xs text-green-400 mt-1 animate-slide-down">
                <i className="fa-regular fa-circle-check mr-1" />
                Passwords match
              </p>
            )}
            {validationErrors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 animate-slide-down">{validationErrors.confirmPassword}</p>
            )}
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
                Creating account...
              </span>
            ) : (
              'Sign Up'
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
          Already have an account?{' '}
          <Link to="/login" className="text-brand-pink font-semibold hover:text-brand-cyan transition-colors">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Signup;


