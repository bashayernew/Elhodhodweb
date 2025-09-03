import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/dashboard/user';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('errors.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('errors.invalidEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('errors.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('errors.minLength', { min: 6 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password, formData.userType);
      
      if (result.success) {
        // Navigation is handled in the login function
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const userTypes = [
    {
      value: 'user',
      label: t('auth.loginAsUser'),
      icon: UserIcon,
      description: 'Browse services and products'
    },
    {
      value: 'provider',
      label: t('auth.loginAsProvider'),
      icon: WrenchScrewdriverIcon,
      description: 'Offer services and products'
    },
    {
      value: 'admin',
      label: 'Login as Admin',
      icon: ShieldCheckIcon,
      description: 'Manage platform'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-hodhod-gold-light to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark rounded-hodhod flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <span className="text-3xl font-bold text-hodhod-black font-cairo">
              HodHod
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-hodhod-black font-cairo">
            {t('auth.loginTitle')}
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* User Type Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Login as:
          </label>
          <div className="grid grid-cols-1 gap-3">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                className={`p-4 rounded-hodhod border-2 transition-all duration-200 ${
                  formData.userType === type.value
                    ? 'border-hodhod-gold bg-hodhod-gold-light'
                    : 'border-gray-200 bg-white hover:border-hodhod-gold hover:bg-hodhod-gold-light'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <type.icon className={`w-6 h-6 ${
                    formData.userType === type.value ? 'text-hodhod-gold' : 'text-gray-400'
                  }`} />
                  <div className="text-left rtl:text-right">
                    <div className={`font-medium ${
                      formData.userType === type.value ? 'text-hodhod-gold' : 'text-gray-900'
                    }`}>
                      {type.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Field */}
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
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-hodhod-gold focus:ring-hodhod-gold border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                {t('auth.rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-hodhod-gold hover:text-hodhod-gold-dark"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                t('auth.login')
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="bg-gray-50 rounded-hodhod p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>User:</strong> user@hodhod.com / user123</div>
              <div><strong>Provider:</strong> provider@hodhod.com / provider123</div>
              <div><strong>Admin:</strong> {process.env.REACT_APP_ADMIN_EMAIL || 'admin@hodhod.com'} / {process.env.REACT_APP_ADMIN_PASSWORD || 'admin123'}</div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link
                to="/signup"
                className="font-medium text-hodhod-gold hover:text-hodhod-gold-dark"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
