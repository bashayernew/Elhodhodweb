import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const DocumentUploadStep = ({ formData, updateFormData, errors, setErrors, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState({});

  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ [fieldName]: t('errors.invalidFileType') });
      return;
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      setErrors({ [fieldName]: t('errors.fileTooLarge') });
      return;
    }

    setUploading(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      // Upload to backend
      const originBase = '/api';
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const form = new FormData();
      form.append('files', file);
      // If user is not authenticated yet, use public endpoint
      const token = localStorage.getItem('hodhod_token') || '';
      let endpoint = token ? `${base}/upload` : `${originBase}/upload/public`;
      let res = await fetch(endpoint, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form
      });
      let data = await res.json().catch(() => ({}));
      // Fallback to absolute backend if relative failed
      if (!res.ok || !data?.files?.[0]?.url) {
        endpoint = token ? `${base}/upload` : `${base}/upload/public`;
        res = await fetch(endpoint, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: form
        });
        data = await res.json().catch(() => ({}));
      }
      if (!res.ok || !data?.files?.[0]?.url) throw new Error('Upload failed');
      const uploaded = data.files[0];

      const fileData = {
        name: uploaded.originalName || file.name,
        size: uploaded.size || file.size,
        type: uploaded.mimeType || file.type,
        url: uploaded.url
      };
      
      updateFormData({
        documents: {
          ...formData.documents,
          [fieldName]: fileData
        }
      });
      
      // Clear any previous errors
      if (errors[fieldName]) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: ''
        }));
      }
      
      toast.success(t('signup.documents.uploadSuccess'));
    } catch (error) {
      // Demo-friendly fallback: simulate successful upload when backend is unreachable
      if (process.env.NODE_ENV !== 'production') {
        try {
          const demoUrl = URL.createObjectURL(file);
          const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: demoUrl,
            demo: true
          };
          updateFormData({
            documents: {
              ...formData.documents,
              [fieldName]: fileData
            }
          });
          if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
          }
          toast.success(t('signup.documents.uploadSuccess'));
          return;
        } catch (_) {
          // fall through to show the original error below
        }
      }
      setErrors({ [fieldName]: error?.message || t('errors.uploadFailed') });
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileRemove = (fieldName) => {
    updateFormData({
      documents: {
        ...formData.documents,
        [fieldName]: null
      }
    });
  };

  const validateAndNext = () => {
    const newErrors = {};
    
    // Check required documents based on subrole
    if (formData.subrole === 'individual') {
      if (!formData.documents.civilIdFront) {
        newErrors.civilIdFront = t('errors.required');
      }
      if (!formData.documents.civilIdBack) {
        newErrors.civilIdBack = t('errors.required');
      }
    } else if (formData.subrole === 'company') {
      // Company providers must upload listed company documents (Civil IDs not required)
      if (!formData.documents.license) newErrors.license = t('errors.required');
      if (!formData.documents.articlesOfIncorporation) newErrors.articlesOfIncorporation = t('errors.required');
      if (!formData.documents.signatureAuthorization) newErrors.signatureAuthorization = t('errors.required');
      if (!formData.documents.ibanCertificate) newErrors.ibanCertificate = t('errors.required');
      if (!formData.documents.partnerCivilIds) newErrors.partnerCivilIds = t('errors.required');
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const renderFileUpload = (fieldName, label, required = false, description = '') => {
    const file = formData.documents[fieldName];
    const isUploading = uploading[fieldName];
    const hasError = errors[fieldName];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-hodhod p-6 text-center hover:border-hodhod-gold transition-colors">
            <input
              type="file"
              id={fieldName}
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(fieldName, e.target.files[0])}
              className="hidden"
            />
            <label htmlFor={fieldName} className="cursor-pointer">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <span className="text-sm font-medium text-hodhod-gold hover:text-hodhod-gold-dark">
                  {isUploading ? t('signup.documents.uploading') : t('signup.documents.uploadInstructions')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, PDF (max 25MB each)</p>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-hodhod p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <DocumentIcon className="h-8 w-8 text-hodhod-gold" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => handleFileRemove(fieldName)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {hasError && (
          <p className="text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.steps.documents')}
        </h2>
        <p className="text-gray-600">
          {t('signup.documents.description')}
        </p>
      </div>

      {/* Document Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-hodhod p-4">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <DocumentIcon className="h-6 w-6 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              {t('signup.documents.title')}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {t('signup.documents.uploadInstructions')}
            </p>
            {formData.subrole === 'company' && (
              <p className="text-sm text-blue-700 mt-2">
                {t('signup.documents.companyVerificationNotice')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-hodhod-black">
          {t('signup.documents.requiredDocuments')}
        </h3>
        
        {formData.subrole === 'individual' ? (
          <div className="space-y-6">
            {/* Civil ID Front */}
            {renderFileUpload(
              'civilIdFront',
              t('signup.documents.civilIdFront'),
              true,
              t('signup.documents.civilIdFrontDesc')
            )}
            
            {/* Civil ID Back */}
            {renderFileUpload(
              'civilIdBack',
              t('signup.documents.civilIdBack'),
              true,
              t('signup.documents.civilIdBackDesc')
            )}
            
            {/* License removed for individual providers */}
          </div>
         ) : (
          <div className="space-y-6">
            {renderFileUpload('license', t('signup.documents.license'), true, t('signup.documents.licenseDesc'))}
            {renderFileUpload('articlesOfIncorporation', t('signup.documents.articlesOfIncorporation'), true, t('signup.documents.articlesOfIncorporationDesc'))}
            {renderFileUpload('signatureAuthorization', t('signup.documents.signatureAuthorization'), true, t('signup.documents.signatureAuthorizationDesc'))}
            {renderFileUpload('ibanCertificate', t('signup.documents.ibanCertificate'), true, t('signup.documents.ibanCertificateDesc'))}
            {renderFileUpload('partnerCivilIds', t('signup.documents.partnerCivilIds'), true, t('signup.documents.partnerCivilIdsDesc'))}
          </div>
        )}
      </div>

      {/* Company verification note and additional uploads (company only) */}
      {formData.subrole === 'company' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-hodhod-black">
            {t('signup.documents.verificationTimeline')}
          </h3>
          
          {/* Additional documents can be added here */}
          <div className="text-sm text-gray-500">
            {t('signup.documents.companyTimelineNote')}
          </div>
        </div>
      )}

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

export default DocumentUploadStep;
