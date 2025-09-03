import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import CategoryMultiSelect from '../common/CategoryMultiSelect';
import MapPicker from '../Map/MapPicker';

const ProfileCompletionStep = ({ formData, updateFormData, errors, setErrors, onNext, onPrev }) => {
  const { t } = useTranslation();
  const [kuwaitLocations, setKuwaitLocations] = useState({ governorates: [] });
  const [loading, setLoading] = useState(false);
  const pendingRawRef = useRef(null);

  useEffect(() => {
    // Load Kuwait locations data
    const loadLocations = async () => {
      try {
        const response = await fetch('/data/kuwait-locations.json');
        const data = await response.json();
        setKuwaitLocations(data);
      } catch (error) {
        console.error('Failed to load locations:', error);
        // Fallback data
        setKuwaitLocations({
          governorates: [
            {
              id: 'kuwait',
              name: { en: 'Kuwait', ar: 'الكويت' },
              areas: [
                { id: 'kuwait-city', name: { en: 'Kuwait City', ar: 'مدينة الكويت' } },
                { id: 'salmiya', name: { en: 'Salmiya', ar: 'السالمية' } },
                { id: 'hawally', name: { en: 'Hawally', ar: 'حولي' } }
              ]
            }
          ]
        });
      }
    };
    
    loadLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateAndNext = () => {
    const newErrors = {};
    
    if (!formData.governorate) {
      newErrors.governorate = t('errors.required');
    }
    
    if (!formData.area) {
      newErrors.area = t('errors.required');
    }
    if (!formData.block) {
      newErrors.block = t('errors.required');
    }
    if (!formData.street) {
      newErrors.street = t('errors.required');
    }
    if (!formData.houseNumber) {
      newErrors.houseNumber = t('errors.required');
    }

    setErrors(newErrors);
    
    if (formData.role === 'provider') {
      if (!formData.workHours) newErrors.workHours = t('errors.required');
      if (!formData.divisions) newErrors.divisions = t('errors.required');
      if (formData.subrole === 'company' && !formData.brandName) newErrors.brandName = t('errors.required');
    }

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const currentLanguage = formData.preferredLang || 'en';
  const currentGovernorate = kuwaitLocations.governorates.find(g => g.id === formData.governorate);
  const availableAreas = currentGovernorate?.areas || [];

  // Helpers to map reverse-geocoded strings to our known lists
  const normalize = (s = '') => (s || '')
    .toLowerCase()
    .replace(/[()'’`\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const stripGovWord = (s = '') => normalize(s).replace(/\s*governorate$/, '').trim();
  const matchGovernorate = (rawGov) => {
    if (!rawGov) return '';
    const target = stripGovWord(rawGov);
    let found = (kuwaitLocations.governorates || []).find((g) => {
      const name = normalize(g.name?.en || g.id);
      return name === target || name.includes(target) || target.includes(name);
    });
    if (!found) {
      // Try common aliases
      const aliasToId = {
        capital: ['capital', 'al asimah', 'asimah', 'kuwait city', 'al-asimah'],
        hawalli: ['hawalli', 'hawally'],
        farwaniya: ['farwaniya', 'al farwaniyah', 'farwaniyah'],
        ahmadi: ['ahmadi', 'al ahmadi'],
        jahra: ['jahra', 'al jahra', 'al-jahra'],
        mubarak_al_kabeer: ['mubarak al kabeer', 'mubarak al-kabeer', 'mubarak al kabir', 'mubarak alkabir', 'mubarak al-kabir']
      };
      const hit = Object.entries(aliasToId).find(([, aliases]) => aliases.includes(target));
      if (hit) {
        const id = hit[0];
        found = (kuwaitLocations.governorates || []).find((g) => g.id === id);
      }
    }
    return found ? found.id : '';
  };
  const matchArea = (rawArea, govId) => {
    if (!rawArea || !govId) return '';
    const gov = (kuwaitLocations.governorates || []).find((g) => g.id === govId);
    if (!gov) return '';
    const target = normalize(rawArea);
    const found = (gov.areas || []).find((a) => {
      const nm = normalize(a.name?.en || a.id);
      return nm === target || nm.includes(target) || target.includes(nm);
    });
    return found ? found.id : '';
  };

  const applyAddressFromRaw = (raw) => {
    const addr = raw?.address || {};
    const govRaw = addr.state || addr.region || '';
    const arRaw = addr.suburb || addr.town || addr.city_district || addr.neighbourhood || addr.village || addr.city || '';
    const matchedGov = matchGovernorate(govRaw);
    const matchedArea = matchArea(arRaw, matchedGov);
    if (matchedGov) updateFormData({ governorate: matchedGov });
    if (matchedArea) updateFormData({ area: matchedArea });
    if (addr.neighbourhood || addr.suburb) updateFormData({ block: addr.neighbourhood || addr.suburb });
    if (addr.road) updateFormData({ street: addr.road });
    if (addr.house_number) updateFormData({ houseNumber: addr.house_number });
  };

  // If reverse geocode arrived before locations finished loading, retry once locations are available
  useEffect(() => {
    if (pendingRawRef.current && (kuwaitLocations.governorates || []).length) {
      applyAddressFromRaw(pendingRawRef.current);
      pendingRawRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kuwaitLocations]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      updateFormData({ latitude: String(lat), longitude: String(lng) });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        applyAddressFromRaw(data);
      } catch (_) {
        // ignore
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-hodhod-black font-cairo mb-2">
          {t('signup.steps.profile')}
        </h2>
        <p className="text-gray-600">
          {t('signup.profileCompletion.description')}
        </p>
      </div>

      {/* Location Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-hodhod-black flex items-center space-x-2 rtl:space-x-reverse">
          <MapPinIcon className="w-6 h-6 text-hodhod-gold" />
          <span>{t('signup.profileCompletion.location')}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Governorate */}
          <div>
            <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.businessProfile.governorate')}
            </label>
            <select
              id="governorate"
              name="governorate"
              value={formData.governorate}
              onChange={handleChange}
              className={`input-field ${errors.governorate ? 'border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="">{t('common.selectOption')}</option>
              {kuwaitLocations.governorates.map((governorate) => (
                <option key={governorate.id} value={governorate.id}>
                  {governorate.name[currentLanguage]}
                </option>
              ))}
            </select>
            {errors.governorate && (
              <p className="mt-1 text-sm text-red-600">{errors.governorate}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.businessProfile.area')}
            </label>
            <select
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              disabled={!formData.governorate}
              className={`input-field ${errors.area ? 'border-red-500 focus:ring-red-500' : ''} ${
                !formData.governorate ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">{t('common.selectOption')}</option>
              {availableAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name[currentLanguage]}
                </option>
              ))}
            </select>
            {errors.area && (
              <p className="mt-1 text-sm text-red-600">{errors.area}</p>
            )}
          </div>
        </div>

        {/* Map picker to pinpoint user's location */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={handleUseCurrentLocation} className="btn-outline">
              Pin your location
            </button>
          </div>
          <div className="rounded-hodhod overflow-hidden border border-gray-200">
            <MapPicker
              latitude={formData.latitude ? parseFloat(formData.latitude) : undefined}
              longitude={formData.longitude ? parseFloat(formData.longitude) : undefined}
              onChange={({ latitude: lat, longitude: lng, governorate: gov, area: ar, raw }) => {
                updateFormData({ latitude: String(lat), longitude: String(lng) });
                if (raw) {
                  // Attempt to match to our known lists
                  const addr = raw.address || {};
                  const govRaw = addr.state || addr.region || '';
                  const arRaw = addr.suburb || addr.town || addr.city_district || addr.neighbourhood || addr.village || addr.city || '';
                  // Find governorate by english name match
                  const targetGov = stripGovWord(govRaw);
                  const foundGov = kuwaitLocations.governorates.find((g) => {
                    const name = normalize(g.name?.en || g.id);
                    return name === targetGov || name.includes(targetGov) || targetGov.includes(name);
                  });
                  if (foundGov) {
                    updateFormData({ governorate: foundGov.id });
                    const targetArea = normalize(arRaw);
                    const foundArea = (foundGov.areas || []).find((a) => {
                      const nm = normalize(a.name?.en || a.id);
                      return nm === targetArea || nm.includes(targetArea) || targetArea.includes(nm);
                    });
                    if (foundArea) updateFormData({ area: foundArea.id });
                    // Address details similar to post flow
                    if (addr.neighbourhood || addr.suburb) updateFormData({ block: addr.neighbourhood || addr.suburb });
                    if (addr.road) updateFormData({ street: addr.road });
                    if (addr.house_number) updateFormData({ houseNumber: addr.house_number });
                  } else {
                    // Defer mapping until locations load
                    pendingRawRef.current = raw;
                  }
                } else {
                  if (gov) updateFormData({ governorate: gov });
                  if (ar) updateFormData({ area: ar });
                }
              }}
              height={300}
            />
          </div>
          {(formData.latitude && formData.longitude) && (
            <p className="text-sm text-gray-600">Picked: {formData.latitude}, {formData.longitude}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                value={formData.latitude || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 29.3759"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="text"
                value={formData.longitude || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 47.9774"
              />
            </div>
            <div>
              <label htmlFor="block" className="block text-sm font-medium text-gray-700 mb-2">
                Block
              </label>
              <input
                id="block"
                name="block"
                type="text"
                value={formData.block || ''}
                onChange={handleChange}
                className={`input-field ${errors.block ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., 3"
              />
              {errors.block && (<p className="mt-1 text-sm text-red-600">{errors.block}</p>)}
            </div>
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                Street
              </label>
              <input
                id="street"
                name="street"
                type="text"
                value={formData.street || ''}
                onChange={handleChange}
                className={`input-field ${errors.street ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., Abdullah Al Mubarak St."
              />
              {errors.street && (<p className="mt-1 text-sm text-red-600">{errors.street}</p>)}
            </div>
            <div>
              <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                House Number
              </label>
              <input
                id="houseNumber"
                name="houseNumber"
                type="text"
                value={formData.houseNumber || ''}
                onChange={handleChange}
                className={`input-field ${errors.houseNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., 12"
              />
              {errors.houseNumber && (<p className="mt-1 text-sm text-red-600">{errors.houseNumber}</p>)}
            </div>
            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                Apartment
              </label>
              <input
                id="apartment"
                name="apartment"
                type="text"
                value={formData.apartment || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 4B"
              />
            </div>
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                Floor
              </label>
              <input
                id="floor"
                name="floor"
                type="text"
                value={formData.floor || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 2"
              />
            </div>
            <div>
              <label htmlFor="door" className="block text-sm font-medium text-gray-700 mb-2">
                Door Number
              </label>
              <input
                id="door"
                name="door"
                type="text"
                value={formData.door || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 201"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-hodhod-black flex items-center space-x-2 rtl:space-x-reverse">
          <UserIcon className="w-6 h-6 text-hodhod-gold" />
          <span>{t('signup.profileCompletion.personalInfo')}</span>
        </h3>
        
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            {t('signup.businessProfile.bio')}
          </label>
          <textarea
            id="bio"
            name="bio"
            rows="4"
            value={formData.bio}
            onChange={handleChange}
            className="input-field resize-none"
            placeholder={t('signup.profileCompletion.bioPlaceholder')}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('signup.profileCompletion.bioHelp')}
          </p>
        </div>
      </div>

      {/* Business Profile (for providers) */}
      {formData.role === 'provider' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-hodhod-black">
            {t('signup.businessProfile.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand Name */}
            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.businessProfile.brandName')}
              </label>
              <input
                id="brandName"
                name="brandName"
                type="text"
                value={formData.brandName}
                onChange={handleChange}
                className={`input-field ${errors.brandName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder={t('signup.businessProfile.brandNamePlaceholder')}
              />
              {errors.brandName && (
                <p className="mt-1 text-sm text-red-600">{errors.brandName}</p>
              )}
            </div>
          </div>

          {/* Work Hours */}
          <div>
            <label htmlFor="workHours" className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.businessProfile.workHours')}
            </label>
            <input
              id="workHours"
              name="workHours"
              type="text"
              value={formData.workHours}
              onChange={handleChange}
              className={`input-field ${errors.workHours ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder={t('signup.businessProfile.workHoursPlaceholder')}
            />
            {errors.workHours && (
              <p className="mt-1 text-sm text-red-600">{errors.workHours}</p>
            )}
          </div>

          {/* CR Number removed per requirement */}

          {/* Provider types (services/products/both) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.businessProfile.divisions')}</label>
            <div className="flex gap-3 flex-wrap">
              {['services','products','both'].map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="divisions"
                    checked={formData.divisions === opt}
                    onChange={() => updateFormData({ divisions: opt, categories: [] })}
                  />
                  <span className="text-sm capitalize">{opt}</span>
                </label>
              ))}
            </div>
            {errors.divisions && (
              <p className="mt-1 text-sm text-red-600">{errors.divisions}</p>
            )}
          </div>

          {/* Categories multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.businessProfile.categories')}</label>
            <CategoryMultiSelect division={formData.divisions || 'services'} value={formData.categories} onChange={(v) => updateFormData({ categories: v })} />
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

export default ProfileCompletionStep;
