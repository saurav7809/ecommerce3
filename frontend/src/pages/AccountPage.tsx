import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials } from '../store/authSlice';
import { addToast, openAuthModal } from '../store/uiSlice';
import { apiSlice } from '../store/apiSlice';
import {
  useGetCurrentUserQuery,
  useRequestPhoneVerificationMutation,
  useUpdateProfileMutation,
  useVerifyPhoneMutation,
} from '../store/apiSlice';

export default function AccountPage() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: currentUser } = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [requestPhoneVerification, { isLoading: isSendingCode }] = useRequestPhoneVerificationMutation();
  const [verifyPhone, { isLoading: isVerifying }] = useVerifyPhoneMutation();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setFullName(currentUser.fullName);
    setPhone(currentUser.phone ?? '');
  }, [currentUser]);

  useEffect(() => {
    if (!isAuthenticated) dispatch(openAuthModal('login'));
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      const updated = await updateProfile({ fullName: fullName.trim(), phone: phone.trim() || undefined }).unwrap();
      if (token) dispatch(setCredentials({ user: updated, token }));
      dispatch(addToast({ message: 'Profile updated.', type: 'success' }));
    } catch (error: any) {
      setErrorMessage(error?.data?.detail || 'Could not update your profile.');
    }
  };

  const handleSendCode = async () => {
    setErrorMessage('');
    try {
      await requestPhoneVerification().unwrap();
      setPhoneCodeSent(true);
      dispatch(addToast({ message: 'A verification code has been sent.', type: 'success' }));
    } catch (error: any) {
      setErrorMessage(error?.data?.detail || 'Could not send a verification code.');
    }
  };

  const handleVerifyPhone = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');
    try {
      await verifyPhone({ code }).unwrap();
      const updated = await dispatch(
        apiSlice.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      if (token) dispatch(setCredentials({ user: updated, token }));
      setCode('');
      setPhoneCodeSent(false);
      dispatch(addToast({ message: 'Phone number verified.', type: 'success' }));
    } catch (error: any) {
      setErrorMessage(error?.data?.detail || 'That code could not be verified.');
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Account profile</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your profile details and verification status.</p>
      {errorMessage && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{errorMessage}</p>}

      <form onSubmit={handleSave} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700">
          Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={100}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input value={currentUser?.email ?? user?.email ?? ''} readOnly
            className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-600" />
        </label>
        <p className="text-xs text-gray-500">{currentUser?.emailVerified ? 'Email verified' : 'Email not verified'}</p>
        <label className="block text-sm font-medium text-gray-700">
          Mobile phone
          <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <button type="submit" disabled={isSaving}
          className="rounded-lg bg-[#7b189f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">Mobile verification</h2>
        <p className="mt-1 text-sm text-gray-500">
          {currentUser?.phoneVerified ? 'Your mobile number is verified.' : 'Verify your mobile number with a one-time code.'}
        </p>
        {!currentUser?.phoneVerified && (
          <>
            <button type="button" onClick={handleSendCode} disabled={isSendingCode || !currentUser?.phone}
              className="mt-4 rounded-lg border border-[#7b189f] px-4 py-2 text-sm font-semibold text-[#7b189f] disabled:opacity-50">
              {isSendingCode ? 'Sending…' : phoneCodeSent ? 'Resend code' : 'Send verification code'}
            </button>
            {phoneCodeSent && (
              <form onSubmit={handleVerifyPhone} className="mt-4 flex gap-2">
                <input aria-label="Phone verification code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  required value={code} onChange={(event) => setCode(event.target.value)}
                  className="w-40 rounded-lg border border-gray-300 px-3 py-2" />
                <button type="submit" disabled={isVerifying}
                  className="rounded-lg bg-[#7b189f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {isVerifying ? 'Verifying…' : 'Verify'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
