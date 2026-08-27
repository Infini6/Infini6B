import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Email address not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Brand logo */}
        <div className="inline-flex items-center gap-3 select-none group">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="text-left">
            <div className="font-extrabold text-slate-800 text-xl leading-tight tracking-tight">
              MedFlow <span className="text-blue-600 font-semibold text-xs tracking-normal ml-1">CareSync</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Smart Hospital Queue & Portal
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
          Reset password
        </h2>
        <p className="text-slate-500 text-sm">
          Enter your email address and we'll send you a recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 text-green-850 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Recovery Sent</span>
                <p className="text-green-700 mt-0.5">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-850 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Reset Failed</span>
                <p className="text-red-750 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-slate-100 text-sm">
            <Link to="/login" className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
