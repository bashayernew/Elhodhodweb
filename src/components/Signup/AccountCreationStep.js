import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AccountCreationStep = ({ formData, updateFormData, errors, setErrors, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    if (strength <= 4) return 'strong';
    return 'veryStrong';
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-blue-500';
      case 'veryStrong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 'weak':
        return 'Password is weak';
      case 'medium':
        return 'Password is fair';
      case 'strong':
        return 'Password is strong';
      case 'veryStrong':
        return 'Password is very strong';
      default:
        return '';
    }
  };

  const validateAndNext = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = t('errors.required');
    }
    
    if (!formData.lastName) {
      newErrors.lastName = t('errors.required');
    }
    
    if (!formData.email) {
      newErrors.email = t('errors.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('errors.required');
    }
    
    if (!formData.password) {
      newErrors.password = t('errors.required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('errors.minLength', { min: 8 });
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch');
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('auth.termsRequired');
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const passwordStrength = formData.password ? validatePassword(formData.password) : null;

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.steps.account')}
        </h2>
        <p className="text-gray-600">
          {t('signup.accountCreation.description')}
        </p>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-hodhod-black">
          {t('signup.accountCreation.personalInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.firstName')}
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('auth.firstNamePlaceholder')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.lastName')}
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('auth.lastNamePlaceholder')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={t('auth.emailPlaceholder')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder={t('auth.phonePlaceholder')}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Preferred Language */}
        <div>
          <label htmlFor="preferredLang" className="block text-sm font-medium text-gray-700 mb-2">
            {t('auth.preferredLang')}
          </label>
          <select
            id="preferredLang"
            name="preferredLang"
            value={formData.preferredLang}
            onChange={handleChange}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* Password Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-hodhod-black">
          {t('signup.accountCreation.password')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`input-field pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('auth.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {t('auth.passwordRequirements')}
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="h-4 w-4 text-hodhod-gold focus:ring-hodhod-gold border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" className="text-gray-700">
            {t('auth.acceptTerms')}
          </label>
          {errors.agreeToTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
          )}
        </div>
      </div>

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
          onClick={validateAndNext}
          className="btn-primary px-8 py-3 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <span>{t('common.next')}</span>
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AccountCreationStep;
