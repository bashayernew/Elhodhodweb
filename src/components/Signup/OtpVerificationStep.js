import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  PhoneIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiFetch } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const OtpVerificationStep = ({ formData, updateFormData, errors, setErrors, onNext, onPrev }) => {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const isDev = process.env.NODE_ENV !== 'production';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Auto-send OTP when component mounts
    if (!otpSent) {
      handleSendOtp();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    
    // Auto-focus previous input on backspace
    if (!value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async () => {
    setResendLoading(true);
    try {
      // Normalize Kuwait phone format for dev/demo
      const rawPhone = formData.phone || '';
      const normalizedPhone = rawPhone.startsWith('+')
        ? rawPhone
        : (rawPhone.startsWith('0') ? `+965${rawPhone.substring(1)}` : `+965${rawPhone}`);

      await apiFetch('/auth/otp/send', {
        method: 'POST',
        body: { phone: normalizedPhone, email: formData.email }
      });
      
      setOtpSent(true);
      setCountdown(60);
      toast.success(t('auth.otpSent'));
    } catch (error) {
      // Dev fallback: still allow entering 123456 even if sending failed
      if (isDev) {
        setOtpSent(true);
        setCountdown(60);
        toast.success('Dev mode: use OTP 123456');
      } else {
        toast.error(t('errors.otpSendFailed'));
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setErrors({ otp: t('errors.otpIncomplete') });
      return;
    }

    setLoading(true);
    try {
      if (isDev && otpString === '123456') {
        updateFormData({ otp: otpString, phoneVerified: true });
        toast.success(t('auth.phoneVerified'));
        onNext();
        return;
      }

      const resp = await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: { phone: formData.phone, email: formData.email, otp: otpString }
      });
      if (resp?.success) {
        const token = resp.data?.token;
        const user = resp.data?.user;
        if (token && user) {
          localStorage.setItem('hodhod_token', token);
          localStorage.setItem('hodhod_user', JSON.stringify(user));
          localStorage.setItem('hodhod_user_type', user.role || 'user');
          updateUser(user);
        }
        updateFormData({ otp: otpString, phoneVerified: true });
        toast.success(t('auth.phoneVerified'));
        onNext();
      }
    } catch (error) {
      toast.error(t('errors.otpVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const canResend = countdown === 0 && !resendLoading;
  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.steps.verification')}
        </h2>
        <p className="text-gray-600">
          Enter the 6‑digit code we sent to your phone to verify your number.
        </p>
      </div>

      {/* Phone Number Display */}
      <div className="bg-gray-50 rounded-hodhod p-4 text-center">
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
          <PhoneIcon className="w-5 h-5 text-hodhod-gold" />
          <span className="text-sm text-gray-600">
            {t('auth.otpSent')}:
          </span>
        </div>
        <div className="text-lg font-medium text-hodhod-black">
          {formData.phone}
        </div>
      </div>

      {/* OTP Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 text-center">
          {t('auth.enterOtp')}
        </label>
        
        <div className="flex justify-center space-x-3 rtl:space-x-reverse">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-hodhod focus:border-hodhod-gold focus:ring-2 focus:ring-hodhod-gold focus:ring-opacity-50 transition-all duration-200"
              placeholder=""
            />
          ))}
        </div>
        
        {errors.otp && (
          <p className="text-sm text-red-600 text-center">{errors.otp}</p>
        )}
      </div>

      {/* Resend OTP */}
      <div className="text-center">
        {canResend ? (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={resendLoading}
            className="text-hodhod-gold hover:text-hodhod-gold-dark font-medium text-sm disabled:opacity-50"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <div className="spinner w-4 h-4"></div>
                <span>{t('auth.sendingOtp')}</span>
              </span>
            ) : (
              t('auth.resendOtp')
            )}
          </button>
        ) : (
          <p className="text-sm text-gray-500">
            {t('auth.otpCooldown', { seconds: countdown })}
          </p>
        )}
      </div>

      {/* Development Note removed */}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrev}
          className="btn-secondary px-6 py-3 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{t('common.previous')}</span>
        </button>
        
        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={!isOtpComplete || loading}
          className="btn-primary px-8 py-3 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="spinner w-5 h-5"></div>
              <span>{t('auth.verifying')}</span>
            </span>
          ) : (
            <>
              <span>{t('auth.verifyOtp')}</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OtpVerificationStep;
