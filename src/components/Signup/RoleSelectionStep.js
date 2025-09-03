import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon, 
  WrenchScrewdriverIcon,
  CheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const RoleSelectionStep = ({ formData, updateFormData, errors, setErrors, onNext }) => {
  const { t } = useTranslation();

  const handleRoleSelect = (role) => {
    updateFormData({ role, subrole: role === 'provider' ? 'individual' : 'individual' });
    setErrors({});
  };

  const handleSubroleSelect = (subrole) => {
    updateFormData({ subrole });
    setErrors({});
  };

  const validateAndNext = () => {
    if (!formData.role) {
      setErrors({ role: t('errors.required') });
      return;
    }
    if (formData.role === 'provider' && !formData.subrole) {
      setErrors({ subrole: t('errors.required') });
      return;
    }
    onNext();
  };

  const roles = [
    {
      value: 'user',
      label: 'Customer',
      icon: UserIcon,
      description: t('signup.userBenefits.description'),
      features: [
        t('signup.userBenefits.browseServices'),
        t('signup.userBenefits.postRequests'),
        t('signup.userBenefits.participateAuctions'),
        t('signup.userBenefits.manageOrders')
      ]
    },
    {
      value: 'provider',
      label: 'Service Provider',
      icon: WrenchScrewdriverIcon,
      description: t('signup.providerBenefits.description'),
      features: [
        t('signup.providerBenefits.postServices'),
        t('signup.providerBenefits.createAuctions'),
        t('signup.providerBenefits.respondRequests'),
        t('signup.providerBenefits.manageListings')
      ]
    }
  ];

  const subroles = [
    {
      value: 'individual',
      label: t('signup.subrole.individual'),
      icon: UserIcon,
      description: t('signup.subrole.individualDesc')
    },
    {
      value: 'company',
      label: t('signup.subrole.company'),
      icon: BuildingOfficeIcon,
      description: t('signup.subrole.companyDesc')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.chooseRole.title')}
        </h2>
        <p className="text-gray-600">
          {t('signup.chooseRole.description')}
        </p>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          {t('signup.chooseRole.selectRole')}:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => handleRoleSelect(role.value)}
              className={`p-6 rounded-hodhod border-2 transition-all duration-200 text-left rtl:text-right ${
                formData.role === role.value
                  ? 'border-hodhod-gold bg-hodhod-gold-light'
                  : 'border-gray-200 bg-white hover:border-hodhod-gold hover:bg-hodhod-gold-light'
              }`}
            >
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <role.icon className={`w-8 h-8 mt-1 ${
                  formData.role === role.value ? 'text-hodhod-gold' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <div className={`font-semibold text-lg mb-1 ${
                    formData.role === role.value ? 'text-hodhod-gold' : 'text-gray-900'
                  }`}>
                    {role.label}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    {role.description}
                  </div>
                  <ul className="space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-500">
                        <CheckIcon className="w-3 h-3 mr-2 rtl:mr-0 rtl:ml-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role}</p>
        )}
      </div>

      {/* Subrole Selection (for providers) */}
      {formData.role === 'provider' && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            {t('signup.subrole.selectType')}:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subroles.map((subrole) => (
              <button
                key={subrole.value}
                type="button"
                onClick={() => handleSubroleSelect(subrole.value)}
                className={`p-4 rounded-hodhod border-2 transition-all duration-200 text-left rtl:text-right ${
                  formData.subrole === subrole.value
                    ? 'border-hodhod-gold bg-hodhod-gold-light'
                    : 'border-gray-200 bg-white hover:border-hodhod-gold hover:bg-hodhod-gold-light'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <subrole.icon className={`w-6 h-6 ${
                    formData.subrole === subrole.value ? 'text-hodhod-gold' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      formData.subrole === subrole.value ? 'text-hodhod-gold' : 'text-gray-900'
                    }`}>
                      {subrole.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {subrole.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.subrole && (
            <p className="text-sm text-red-600">{errors.subrole}</p>
          )}
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-6">
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

export default RoleSelectionStep;
