import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const ReviewSubmitStep = ({ formData, onSubmit, onPrev, loading }) => {
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState({
    accurateInfo: false,
    acceptTerms: false,
    privacyPolicy: false
  });

  const handleDeclarationChange = (name, checked) => {
    setDeclarations(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const canSubmit = Object.values(declarations).every(Boolean);

  const renderSection = (title, iconEl, children) => (
    <div className="border border-gray-200 rounded-hodhod p-4">
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
        {iconEl}
        <h3 className="font-medium text-hodhod-black">{title}</h3>
      </div>
      {children}
    </div>
  );

  const renderField = (label, value) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.steps.review')}
        </h2>
        <p className="text-gray-600">
          {t('signup.review.description')}
        </p>
      </div>

      {/* Review Sections */}
      <div className="space-y-6">
        {/* Account Type */}
        {renderSection(
          t('signup.review.accountType'),
          (formData.role === 'user' ? <UserIcon className="w-5 h-5 text-hodhod-gold" /> : <WrenchScrewdriverIcon className="w-5 h-5 text-hodhod-gold" />),
          <div className="space-y-2">
            {renderField('Account role', t(`signup.chooseRole.${formData.role}`))}
            {formData.role === 'provider' && (
              renderField(t('signup.subrole.type'), t(`signup.subrole.${formData.subrole}`), true)
            )}
          </div>
        )}

        {/* Personal Information */}
        {renderSection(
          t('signup.review.personalInfo'),
          <UserIcon className="w-5 h-5 text-hodhod-gold" />,
          <div className="space-y-2">
            {renderField(t('auth.firstName'), formData.firstName, true)}
            {renderField(t('auth.lastName'), formData.lastName, true)}
            {renderField(t('auth.email'), formData.email, true)}
            {renderField(t('auth.phone'), formData.phone, true)}
            {renderField(t('auth.preferredLang'), formData.preferredLang === 'en' ? 'English' : 'العربية')}
          </div>
        )}

        {/* Location */}
        {renderSection(
          t('signup.review.location'),
          <MapPinIcon className="w-5 h-5 text-hodhod-gold" />,
          <div className="space-y-2">
            {renderField('Governorate', formData.governorate)}
            {renderField('Area', formData.area)}
            {renderField('Bio', formData.bio)}
          </div>
        )}

        {/* Business Profile (for providers) */}
        {formData.role === 'provider' && (
          renderSection(
            t('signup.review.businessProfile'),
            <WrenchScrewdriverIcon className="w-5 h-5 text-hodhod-gold" />,
            <div className="space-y-2">
              {renderField(t('signup.businessProfile.brandName'), formData.brandName)}
              {renderField(t('signup.businessProfile.workHours'), formData.workHours)}
            </div>
          )
        )}

        {/* Documents (for providers) */}
        {formData.role === 'provider' && (
          renderSection(
            t('signup.review.documents'),
            <DocumentIcon className="w-5 h-5 text-hodhod-gold" />,
            <div className="space-y-2">
              {formData.subrole === 'individual' ? (
                <>
                  {renderField(
                    t('signup.documents.civilIdFront'),
                    formData.documents.civilIdFront ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                  {renderField(
                    t('signup.documents.civilIdBack'),
                    formData.documents.civilIdBack ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                </>
              ) : (
                <>
                  {renderField(
                    t('signup.documents.license'),
                    formData.documents.license ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                  {renderField(
                    t('signup.documents.articlesOfIncorporation'),
                    formData.documents.articlesOfIncorporation ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                  {renderField(
                    t('signup.documents.signatureAuthorization'),
                    formData.documents.signatureAuthorization ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                  {renderField(
                    t('signup.documents.ibanCertificate'),
                    formData.documents.ibanCertificate ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                  {renderField(
                    t('signup.documents.partnerCivilIds'),
                    formData.documents.partnerCivilIds ? '✓ Uploaded' : '✗ Missing',
                    true
                  )}
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* Declarations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-hodhod-black">
          {t('signup.review.declarations')}
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="accurateInfo"
                name="accurateInfo"
                type="checkbox"
                checked={declarations.accurateInfo}
                onChange={(e) => handleDeclarationChange('accurateInfo', e.target.checked)}
                className="h-4 w-4 text-hodhod-gold focus:ring-hodhod-gold border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="accurateInfo" className="text-gray-700">
                {t('signup.review.accurateInfo')}
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={declarations.acceptTerms}
                onChange={(e) => handleDeclarationChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 text-hodhod-gold focus:ring-hodhod-gold border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                {t('signup.review.acceptTerms')}
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacyPolicy"
                name="privacyPolicy"
                type="checkbox"
                checked={declarations.privacyPolicy}
                onChange={(e) => handleDeclarationChange('privacyPolicy', e.target.checked)}
                className="h-4 w-4 text-hodhod-gold focus:ring-hodhod-gold border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacyPolicy" className="text-gray-700">
                {t('signup.review.privacyPolicy')}
              </label>
            </div>
          </div>
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
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="btn-primary px-8 py-3 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="spinner w-5 h-5"></div>
              <span>{t('signup.review.submitting')}</span>
            </span>
          ) : (
            <>
              <CheckIcon className="w-5 h-5" />
              <span>{t('signup.review.submit')}</span>
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {loading && (
        <div className="text-center text-sm text-gray-500">
          {t('signup.review.submittingDescription')}
        </div>
      )}
    </div>
  );
};

export default ReviewSubmitStep;
