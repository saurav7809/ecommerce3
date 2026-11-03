import React, { useEffect, useRef, useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { closeAuthModal, openAuthModal, addToast } from '../../store/uiSlice';
import { setCredentials } from '../../store/authSlice';
import {
  useGoogleLoginMutation,
  useLoginMutation,
  useRegisterMutation,
  useRequestEmailVerificationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} from '../../store/apiSlice';

type Flow = 'auth' | 'verify-email' | 'forgot-request' | 'forgot-reset';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { detail?: string; message?: string } }).data;
    if (data?.detail || data?.message) return data.detail || data.message || fallback;
  }
  return fallback;
}

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, authModalMode } = useAppSelector((state) => state.ui);
  const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [googleLoginApi] = useGoogleLoginMutation();
  const [requestEmailVerification] = useRequestEmailVerificationMutation();
  const [verifyEmailApi, { isLoading: isVerifyLoading }] = useVerifyEmailMutation();
  const [requestPasswordReset] = useRequestPasswordResetMutation();
  const [resetPasswordApi, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const [flow, setFlow] = useState<Flow>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [errorMessage, setErrorMessage] = useState('');
  const googleButton = useRef<HTMLDivElement>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isLogin = authModalMode === 'login';

  useEffect(() => {
    if (!isAuthModalOpen || flow !== 'auth' || !isLogin || !googleClientId || !googleButton.current) return;

    let disposed = false;
    const renderGoogleButton = () => {
      if (disposed || !window.google || !googleButton.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          void googleLoginApi({ idToken: response.credential }).unwrap()
            .then((result) => {
              dispatch(setCredentials({ user: result.user, token: result.token }));
              dispatch(addToast({ message: `Welcome, ${result.user.fullName}!`, type: 'success' }));
              dispatch(closeAuthModal());
            })
            .catch((error: unknown) => setErrorMessage(getErrorMessage(error, 'Google sign-in failed.')));
        },
      });
      googleButton.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width: 320 });
    };

    let script = document.getElementById('google-identity-sdk') as HTMLScriptElement | null;
    if (window.google) {
      renderGoogleButton();
    } else {
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-identity-sdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
    }

    return () => {
      disposed = true;
      script?.removeEventListener('load', renderGoogleButton);
    };
  }, [dispatch, flow, googleClientId, googleLoginApi, isAuthModalOpen, isLogin]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      if (flow === 'verify-email') {
        await verifyEmailApi({ email: email.trim(), code }).unwrap();
        setFlow('auth');
        dispatch(openAuthModal('login'));
        dispatch(addToast({ message: 'Email verified. You can now sign in.', type: 'success' }));
        return;
      }
      if (flow === 'forgot-request') {
        await requestPasswordReset({ email: email.trim() }).unwrap();
        setFlow('forgot-reset');
        dispatch(addToast({ message: 'If that account exists, a reset code has been sent.', type: 'success' }));
        return;
      }
      if (flow === 'forgot-reset') {
        await resetPasswordApi({ email: email.trim(), code, newPassword: password }).unwrap();
        setFlow('auth');
        dispatch(openAuthModal('login'));
        setPassword('');
        dispatch(addToast({ message: 'Password updated. Please sign in.', type: 'success' }));
        return;
      }
      if (isLogin) {
        const result = await loginApi({ email: email.trim(), password }).unwrap();
        dispatch(setCredentials({ user: result.user, token: result.token }));
        dispatch(addToast({ message: `Welcome back, ${result.user.fullName}!`, type: 'success' }));
        dispatch(closeAuthModal());
      } else {
        await registerApi({
          name: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          accountType: role,
        }).unwrap();
        await requestEmailVerification({ email: email.trim() }).unwrap();
        setFlow('verify-email');
        setCode('');
        dispatch(addToast({ message: 'Check the backend console for your local email verification code.', type: 'success' }));
      }
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'The request could not be completed. Please try again.'));
    }
  };

  const changeMode = (mode: 'login' | 'register') => {
    setErrorMessage('');
    setFlow('auth');
    dispatch(openAuthModal(mode));
  };

  const resendCode = async () => {
    setErrorMessage('');
    try {
      if (flow === 'verify-email') await requestEmailVerification({ email: email.trim() }).unwrap();
      else await requestPasswordReset({ email: email.trim() }).unwrap();
      dispatch(addToast({ message: 'If the account exists and needs a code, a new one has been sent.', type: 'success' }));
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'Could not send another code yet.'));
    }
  };

  const startEmailVerification = async () => {
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Enter your email address first.');
      return;
    }
    try {
      await requestEmailVerification({ email: email.trim() }).unwrap();
      setCode('');
      setFlow('verify-email');
      dispatch(addToast({ message: 'If that account needs verification, a code has been sent.', type: 'success' }));
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, 'Could not send a verification code.'));
    }
  };

  const title = flow === 'verify-email'
    ? 'Verify your email'
    : flow === 'forgot-request' || flow === 'forgot-reset'
      ? 'Reset your password'
      : isLogin ? 'Sign In to HomeNest' : 'Create Your Account';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(closeAuthModal())} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <button onClick={() => dispatch(closeAuthModal())}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#7b189f] text-xl font-bold text-white">H</div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-xs text-gray-500">
              {flow === 'verify-email' ? `Enter the six-digit code sent to ${email}.`
                : flow === 'forgot-request' ? 'Enter your account email to receive a reset code.'
                  : flow === 'forgot-reset' ? `Enter the code sent to ${email} and choose a new password.`
                    : isLogin ? 'Access your orders, saved favorites, and designer picks'
                      : 'Join HomeNest for exclusive deals and personalized home styling'}
            </p>
          </div>

          {flow === 'auth' && (
            <div className="mb-6 flex border-b border-gray-100 text-sm font-semibold">
              {(['login', 'register'] as const).map((mode) => (
                <button key={mode} onClick={() => changeMode(mode)}
                  className={`flex-1 border-b-2 pb-2.5 text-center transition-colors ${
                    authModalMode === mode ? 'border-[#7b189f] text-[#7b189f]' : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}>
                  {mode === 'login' ? 'Sign In' : 'New Customer / Seller'}
                </button>
              ))}
            </div>
          )}

          {errorMessage && <div role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {flow === 'auth' && !isLogin && (
              <>
                <label className="block text-xs font-bold text-gray-700">
                  Full Name
                  <span className="relative mt-1 block">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="text" required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your name" className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#7b189f] focus:outline-hidden" />
                  </span>
                </label>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-700">Account Role</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    {(['CUSTOMER', 'SELLER'] as const).map((value) => (
                      <button key={value} type="button" onClick={() => setRole(value)}
                        className={`rounded-lg border px-3 py-2 ${role === value ? 'border-[#7b189f] bg-purple-50 text-[#7b189f]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {value === 'CUSTOMER' ? 'Customer' : 'Seller / Merchant'}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block text-xs font-bold text-gray-700">
                  Phone (Optional)
                  <span className="relative mt-1 block">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#7b189f] focus:outline-hidden" />
                  </span>
                </label>
              </>
            )}

            {(flow === 'auth' || flow === 'verify-email' || flow === 'forgot-request' || flow === 'forgot-reset') && (
              <label className="block text-xs font-bold text-gray-700">
                Email Address
                <span className="relative mt-1 block">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input type="email" required value={email} readOnly={flow === 'verify-email' || flow === 'forgot-reset'}
                    onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#7b189f] focus:outline-hidden read-only:bg-gray-50" />
                </span>
              </label>
            )}

            {(flow === 'verify-email' || flow === 'forgot-reset') && (
              <label className="block text-xs font-bold text-gray-700">
                Six-digit code
                <input type="text" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-widest focus:border-[#7b189f] focus:outline-hidden" />
              </label>
            )}

            {(flow === 'auth' && isLogin || flow === 'forgot-reset') && (
              <label className="block text-xs font-bold text-gray-700">
                {flow === 'forgot-reset' ? 'New password' : 'Password'}
                <span className="relative mt-1 block">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input type="password" required minLength={8} maxLength={100} value={password}
                    onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#7b189f] focus:outline-hidden" />
                </span>
              </label>
            )}

            <button type="submit" disabled={isLoginLoading || isRegisterLoading || isVerifyLoading || isResetLoading}
              className="w-full rounded-xl bg-[#7b189f] py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#581172] disabled:opacity-50">
              {flow === 'verify-email' ? isVerifyLoading ? 'Verifying…' : 'Verify email'
                : flow === 'forgot-request' ? 'Send reset code'
                  : flow === 'forgot-reset' ? isResetLoading ? 'Updating…' : 'Update password'
                    : isLoginLoading || isRegisterLoading ? 'Processing…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {flow === 'auth' && isLogin && (
            <>
              <button type="button" onClick={() => void startEmailVerification()}
                className="mt-3 w-full text-center text-xs font-semibold text-[#7b189f] hover:underline">
                Resend verification code
              </button>
              <button type="button" onClick={() => { setErrorMessage(''); setFlow('forgot-request'); }}
                className="mt-3 w-full text-center text-xs font-semibold text-[#7b189f] hover:underline">
                Forgot password?
              </button>
              {googleClientId && <div className="mt-4 flex justify-center"><div ref={googleButton} /></div>}
              <div className="mt-6 space-y-1 rounded-lg border-t border-gray-100 bg-gray-50 p-2.5 pt-4 text-[11px] text-gray-500">
                <p className="font-bold text-gray-700">Quick Test Credentials:</p>
                <p>Admin: <code className="text-[#7b189f]">admin@homenest.local</code> / <code className="text-[#7b189f]">Admin@12345</code></p>
                <p>Customer: <code className="text-[#7b189f]">customer@homenest.local</code> / <code className="text-[#7b189f]">Customer@12345</code></p>
              </div>
            </>
          )}

          {flow !== 'auth' && (
            <div className="mt-4 space-y-3">
              {(flow === 'verify-email' || flow === 'forgot-reset') && (
                <button type="button" onClick={() => void resendCode()}
                  className="w-full text-center text-xs font-semibold text-[#7b189f] hover:underline">
                  Resend code
                </button>
              )}
              <button type="button" onClick={() => { setFlow('auth'); dispatch(openAuthModal('login')); setErrorMessage(''); }}
                className="w-full text-center text-xs font-semibold text-[#7b189f] hover:underline">
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
