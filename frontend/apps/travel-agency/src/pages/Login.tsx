import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiLogin, apiResendVerification } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setLoading(true);
    try {
      const { user } = await apiLogin(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/travelers');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.toLowerCase().includes('verify')) {
        setUnverified(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await apiResendVerification(email);
      setResendSent(true);
    } catch {
      /* silently ignore — same message either way */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✈️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Travel Agency Portal</h1>
            <p className="text-gray-500 mt-1">MenaML Event Management</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@wanderlust.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {unverified && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 space-y-2">
                <p className="text-sm text-amber-800">
                  Your email is not verified yet. Check your inbox or resend the verification link.
                </p>
                {resendSent ? (
                  <p className="text-sm text-teal-700 font-medium">Verification email sent!</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm text-teal-700 font-medium hover:underline"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <Link to="/forgot-password" className="text-teal-600 font-medium hover:underline">
              Forgot password?
            </Link>
            <Link to="/register" className="text-teal-600 font-medium hover:underline">
              Register your agency
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
