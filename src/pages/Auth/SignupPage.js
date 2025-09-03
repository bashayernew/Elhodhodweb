import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PhoneIcon,
  DocumentIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Import step components
import RoleSelectionStep from '../../components/Signup/RoleSelectionStep';
import AccountCreationStep from '../../components/Signup/AccountCreationStep';
import OtpVerificationStep from '../../components/Signup/OtpVerificationStep';
import ProfileCompletionStep from '../../components/Signup/ProfileCompletionStep';
import DocumentUploadStep from '../../components/Signup/DocumentUploadStep';
import ReviewSubmitStep from '../../components/Signup/ReviewSubmitStep';

const SignupPage = () => {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1: Role Selection
    role: 'user',
    subrole: 'individual',
    
    // Step 2: Account Creation
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredLang: 'en',
    agreeToTerms: false,
    
    // Step 3: OTP Verification
    otp: '',
    phoneVerified: false,
    
    // Step 4: Profile Completion
    governorate: '',
    area: '',
    block: '',
    street: '',
    houseNumber: '',
    latitude: '',
    longitude: '',
    apartment: '',
    floor: '',
    door: '',
    bio: '',
    
    // Step 5: Business Profile (for providers)
    brandName: '',
    divisions: [],
    categories: [],
    workHours: '',
    serviceRadiusKm: 10,
    crNumber: '',
    
    // Documents (for providers)
    documents: {
      civilIdFront: null,
      civilIdBack: null,
      license: null,
      articlesOfIncorporation: null,
      signatureAuthorization: null,
      partnerCivilIds: []
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update total steps based on role
  useEffect(() => {
    if (formData.role === 'provider') {
      setTotalSteps(6); // Include document upload step
    } else {
      setTotalSteps(5);
    }
  }, [formData.role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        acceptTerms: Boolean(formData.agreeToTerms),
        role: formData.role,
        subrole: formData.subrole,
        preferredLang: formData.preferredLang,
        governorate: formData.governorate,
        area: formData.area,
        block: formData.block || null,
        street: formData.street || null,
        houseNumber: formData.houseNumber || null,
        apartment: formData.apartment || null,
        floor: formData.floor || null,
        door: formData.door || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        bio: formData.bio
      };

      if (formData.role === 'provider') {
        userData.provider = {
          brandName: formData.brandName,
          divisions: formData.divisions,
          categories: formData.categories,
          workHours: formData.workHours,
          serviceRadiusKm: formData.serviceRadiusKm,
          crNumber: formData.crNumber
        };
        userData.documents = formData.documents;
      }
      
      const result = await signup(userData, formData.role);
      
      if (result.success) {
        toast.success(t('signup.success'));
        // Navigation is handled in the signup function
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(t('errors.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelectionStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <AccountCreationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <OtpVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ProfileCompletionStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        if (formData.role === 'provider') {
          return (
            <DocumentUploadStep
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
              setErrors={setErrors}
              onNext={nextStep}
              onPrev={prevStep}
            />
          );
        } else {
          return (
            <ReviewSubmitStep
              formData={formData}
              onSubmit={handleSubmit}
              onPrev={prevStep}
              loading={loading}
            />
          );
        }
      case 6:
        return (
          <ReviewSubmitStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hodhod-gold-light to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark rounded-hodhod flex items-center justify-center">
              <span className="text-white font-bold text-2xl">H</span>
            </div>
            <span className="text-3xl font-bold text-hodhod-black font-cairo">
              HodHod
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-hodhod-black font-cairo mb-2">
            {t('signup.title')}
          </h1>
          <p className="text-gray-600">
            {t('signup.description')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'bg-hodhod-gold text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    index + 1
              )}
            </div>
                {index < totalSteps - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-hodhod-gold' : 'bg-gray-200'
                    }`}
                  />
              )}
            </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500">
            {t(`signup.steps.${currentStep}`)}
            </div>
          </div>

        {/* Step Content */}
        <div className="bg-white rounded-hodhod shadow-lg p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-hodhod-gold hover:text-hodhod-gold-dark"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
};

export default SignupPage;
