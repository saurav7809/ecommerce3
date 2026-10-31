import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeAuthModal, openAuthModal, addToast } from '../../store/uiSlice';
import { setCredentials } from '../../store/authSlice';
import { useLoginMutation, useRegisterMutation } from '../../store/apiSlice';

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, authModalMode } = useAppSelector((state) => state.ui);

  const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (isLogin) {
        const resp = await loginApi({ email: email.trim(), password }).unwrap();
        dispatch(setCredentials({ user: resp.user, token: resp.token }));
        dispatch(addToast({ message: `Welcome back, ${resp.user.fullName}!`, type: 'success' }));
        dispatch(closeAuthModal());
      } else {
        const resp = await registerApi({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          role,
        }).unwrap();
        dispatch(setCredentials({ user: resp.user, token: resp.token }));
        dispatch(addToast({ message: `Account created! Welcome, ${resp.user.fullName}!`, type: 'success' }));
        dispatch(closeAuthModal());
      }
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.message || 'Authentication failed. Please check your credentials.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(closeAuthModal())}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#7b189f] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              H
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isLogin ? 'Sign In to HomeNest' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isLogin
                ? 'Access your orders, saved favorites, and designer picks'
                : 'Join HomeNest for exclusive deals and personalized home styling'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-gray-100 mb-6 text-sm font-semibold">
            <button
              onClick={() => {
                setErrorMessage('');
                dispatch(openAuthModal('login'));
              }}
              className={`flex-1 pb-2.5 text-center transition-colors border-b-2 ${
                isLogin
                  ? 'border-[#7b189f] text-[#7b189f]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setErrorMessage('');
                dispatch(openAuthModal('register'));
              }}
              className={`flex-1 pb-2.5 text-center transition-colors border-b-2 ${
                !isLogin
                  ? 'border-[#7b189f] text-[#7b189f]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              New Customer / Seller
            </button>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Saurav Sharma"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRole('CUSTOMER')}
                      className={`py-2 px-3 rounded-lg border text-center transition-colors ${
                        role === 'CUSTOMER'
                          ? 'bg-purple-50 border-[#7b189f] text-[#7b189f]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('SELLER')}
                      className={`py-2 px-3 rounded-lg border text-center transition-colors ${
                        role === 'SELLER'
                          ? 'bg-purple-50 border-[#7b189f] text-[#7b189f]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Seller / Merchant
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#7b189f] focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoginLoading || isRegisterLoading}
              className="w-full py-2.5 rounded-xl bg-[#7b189f] hover:bg-[#581172] text-white text-sm font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {isLoginLoading || isRegisterLoading
                ? 'Processing...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Credentials Tip */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg space-y-1">
            <p className="font-bold text-gray-700">Quick Test Credentials:</p>
            <p>Admin: <code className="text-[#7b189f]">admin@homenest.local</code> / <code className="text-[#7b189f]">Admin@12345</code></p>
            <p>Customer: <code className="text-[#7b189f]">customer@homenest.local</code> / <code className="text-[#7b189f]">Customer@12345</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
