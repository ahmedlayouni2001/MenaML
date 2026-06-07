import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiResendVerification } from '../services/api';

export default function VerifyEmailSent() {
  const email = sessionStorage.getItem('pendingVerifyEmail') || '';
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await apiResendVerification(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
          <p className="text-gray-500 mb-1">We sent a verification link to</p>
          {email && <p className="font-medium text-gray-800 mb-6">{email}</p>}
          <p className="text-sm text-gray-500 mb-8">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>

          {sent ? (
            <p className="text-sm text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">
              New verification link sent!
            </p>
          ) : (
            <div className="space-y-3">
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {email && (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full py-2.5 border border-teal-600 text-teal-600 rounded-lg font-medium text-sm hover:bg-teal-50 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
