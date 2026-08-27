import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
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
          Sign in to your portal
        </h2>
        <p className="text-slate-500 text-sm">
          Access your digital health card, bookings, and live queue position.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {sessionExpired && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 text-orange-850 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Session Expired</span>
                <p className="text-orange-700 mt-0.5">Your session has expired. Please sign in again.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-850 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Authentication Failed</span>
                <p className="text-red-750 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl shadow-sm shadow-blue-500/10 hover:shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-sm">
            <span className="text-slate-500">New to MedFlow?</span>{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
