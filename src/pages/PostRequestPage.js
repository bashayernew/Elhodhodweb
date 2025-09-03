import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PhotoIcon, MicrophoneIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import MapPicker from '../components/Map/MapPicker';
import { apiFetch } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PostRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const [type, setType] = useState('service'); // 'service' | 'product'
  const [categoriesData, setCategoriesData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const [locationsData, setLocationsData] = useState(null);
  const [governorate, setGovernorate] = useState('');
  const [area, setArea] = useState('');
  const [block, setBlock] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [description, setDescription] = useState('');
  const [apartment, setApartment] = useState('');
  const [floor, setFloor] = useState('');
  const [door, setDoor] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(false);
  const savedAddresses = (user?.addresses && Array.isArray(user.addresses)) ? user.addresses : [];
  const [selectedSavedId, setSelectedSavedId] = useState('');

  const [attachments, setAttachments] = useState([]); // {name,url,type,kind}
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes('post-product-request')) {
      setType('product');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL || ''}/data/kuwait-locations.json`).then(r => r.json()),
          fetch(`${process.env.PUBLIC_URL || ''}/data/${type === 'service' ? 'service-categories.json' : 'product-categories.json'}`).then(r => r.json())
        ]);
        setLocationsData(locRes);
        setCategoriesData(catRes);
        setSelectedCategory('');
        setSelectedSubcategory('');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    };
    load();
  }, [type]);

  const categories = useMemo(() => {
    const items = categoriesData?.categories || [];
    return [{ value: '', label: 'Select category' }, ...items.map((c) => ({ value: c.slug || c.name_en || c.id, label: c.name_en || c.name?.en || c.id }))];
  }, [categoriesData]);

  const subcategories = useMemo(() => {
    const found = (categoriesData?.categories || []).find((c) => (c.slug || c.name_en || c.id) === selectedCategory);
    return found ? (found.subcategories || []).map((s) => ({ value: s.slug || s.name_en || s.id, label: s.name_en || s.name?.en || s.id })) : [];
  }, [selectedCategory, categoriesData]);

  const governorates = useMemo(() => (locationsData?.governorates || []).map((g) => ({ value: g.name?.en || g.en || g.id, label: g.name?.en || g.en || g.id })), [locationsData]);
  const areas = useMemo(() => {
    const g = (locationsData?.governorates || []).find((x) => (x.name?.en || x.en || x.id) === governorate);
    return g ? g.areas.map((a) => ({ value: a.name?.en || a.en || a.id, label: a.name?.en || a.en || a.id })) : [];
  }, [governorate, locationsData]);

  const normalize = (s = '') => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const stripGovWord = (s = '') => normalize(s).replace(/\s*governorate$/, '').trim();

  const matchGovernorate = (rawGov) => {
    if (!rawGov || !locationsData) return '';
    const target = stripGovWord(rawGov);
    const found = (locationsData.governorates || []).find((g) => {
      const name = normalize(g.name?.en || g.en || g.id);
      return name === target || name.includes(target) || target.includes(name);
    });
    return found ? (found.name?.en || found.en || found.id) : '';
  };

  const matchArea = (rawArea, matchedGov) => {
    if (!rawArea || !matchedGov || !locationsData) return '';
    const g = (locationsData.governorates || []).find((x) => (x.name?.en || x.en || x.id) === matchedGov);
    if (!g) return '';
    const target = normalize(rawArea);
    const a = (g.areas || []).find((ar) => {
      const name = normalize(ar.name?.en || ar.en || ar.id);
      return name === target || name.includes(target) || target.includes(name);
    });
    return a ? (a.name?.en || a.en || a.id) : '';
  };

  const applyAddressFromRaw = (raw) => {
    if (!raw?.address) return;
    const addr = raw.address;
    const govRaw = addr.state || addr.region || '';
    const arRaw = addr.suburb || addr.town || addr.city_district || addr.neighbourhood || addr.village || addr.city || '';
    const matchedGov = matchGovernorate(govRaw);
    const matchedArea = matchArea(arRaw, matchedGov);
    if (matchedGov) setGovernorate(matchedGov);
    if (matchedArea) setArea(matchedArea);
    if (addr.neighbourhood || addr.suburb) setBlock(addr.neighbourhood || addr.suburb);
    if (addr.road) setStreet(addr.road);
    if (addr.house_number) setHouseNumber(addr.house_number);
  };

  const handlePickLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(String(lat));
      setLongitude(String(lng));
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        applyAddressFromRaw(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });
  };

  const applySavedAddress = (addr) => {
    if (!addr) return;
    setAddressLabel(addr.label || '');
    setGovernorate(addr.governorate || '');
    setArea(addr.city || addr.area || '');
    setBlock(addr.block || '');
    setStreet(addr.line1 || addr.street || '');
    setHouseNumber(addr.houseNumber || '');
    setApartment(addr.apartment || '');
    setFloor(addr.floor || '');
    setDoor(addr.door || '');
  };

  const uploadFiles = async (files, kind) => {
    const list = Array.from(files || []);
    if (!list.length) return [];
    const form = new FormData();
    list.forEach((f) => form.append('files', f));
    const res = await fetch(`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api')}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('hodhod_token') || ''}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');
    return (data.files || []).map((f) => ({ name: f.originalName, url: f.url, type: f.mimeType, kind }));
  };

  const onImagesChange = async (e) => {
    try {
      const mapped = await uploadFiles(e.target.files, 'image');
      setAttachments((prev) => [...prev, ...mapped]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const onAudioChange = async (e) => {
    try {
      const mapped = await uploadFiles(e.target.files, 'audio');
      setAttachments((prev) => [...prev, ...mapped]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const onVideoChange = async (e) => {
    try {
      const mapped = await uploadFiles(e.target.files, 'video');
      setAttachments((prev) => [...prev, ...mapped]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Recording not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
          const mapped = await uploadFiles([file], 'audio');
          setAttachments((prev) => [...prev, ...mapped]);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError(err.message || 'Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let fullDescription = description;
      const extra = [apartment && `Apartment: ${apartment}`, floor && `Floor: ${floor}`, door && `Door: ${door}`].filter(Boolean).join(' | ');
      if (extra) fullDescription = `${description}\n\n${extra}`;

      const body = {
        type,
        category: selectedCategory,
        subcategory: selectedSubcategory || null,
        description: fullDescription,
        governorate,
        area,
        block: block || null,
        street: street || null,
        houseNumber: houseNumber || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        attachments
      };

      await apiFetch('/post-requests', { method: 'POST', body });

      // Optionally save address to customer's profile
      if (saveToProfile) {
        const newAddr = {
          id: `addr-${Date.now()}`,
          label: addressLabel || 'Saved address',
          line1: street || '',
          city: area || '',
          governorate: governorate || '',
          block: block || '',
          houseNumber: houseNumber || '',
          apartment,
          floor,
          door,
          phone: user?.phone || ''
        };
        try {
          const next = [...savedAddresses, newAddr];
          updateUser({ ...(user||{}), addresses: next });
        } catch (_) { /* no-op in demo */ }
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-hodhod py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a service or product request</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-hodhod shadow-hodhod p-6 space-y-6">
          {/* Saved addresses selector */}
          {savedAddresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Use saved address</label>
                <select className="w-full input-field" value={selectedSavedId} onChange={(e)=>{
                  const val = e.target.value; setSelectedSavedId(val);
                  const found = savedAddresses.find(a=> (a.id || a.label) === val);
                  if (found) applySavedAddress(found);
                }}>
                  <option value="">New address…</option>
                  {savedAddresses.map((a)=> (
                    <option key={a.id || a.label} value={a.id || a.label}>{a.label || a.line1 || a.city}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button type="button" className="btn-outline w-full" onClick={()=>{ setSelectedSavedId(''); applySavedAddress({}); }}>Clear</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Request Type</label>
              <select className="w-full input-field" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="service">Service</option>
                <option value="product">Product</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full input-field" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}>
                {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Subcategory</label>
                <select className="w-full input-field" value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
                  <option value="">None</option>
                  {subcategories.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full input-field resize-none" rows={4} placeholder="Describe what you need" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address label</label>
              <input className="w-full input-field" value={addressLabel} onChange={(e)=>setAddressLabel(e.target.value)} placeholder="e.g., Home, Office" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Governorate</label>
              <select className="w-full input-field" value={governorate} onChange={(e) => { setGovernorate(e.target.value); setArea(''); }}>
                <option value="">Select</option>
                {governorates.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area</label>
              <select className="w-full input-field" value={area} onChange={(e) => setArea(e.target.value)} disabled={!governorate}>
                <option value="">Select</option>
                {areas.map((a) => (<option key={a.value} value={a.value}>{a.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Block</label>
              <input className="w-full input-field" value={block} onChange={(e) => setBlock(e.target.value)} placeholder="e.g., 3" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street</label>
              <input className="w-full input-field" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g., Abdullah Al Mubarak St." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">House Number</label>
              <input className="w-full input-field" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="e.g., 12" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input className="w-full input-field" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g., 29.3759" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input className="w-full input-field" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g., 47.9774" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <button type="button" onClick={handlePickLocation} className="btn-outline">Use current location</button>
              <div className="rounded-hodhod overflow-hidden border border-gray-200">
                <MapPicker
                  latitude={latitude ? parseFloat(latitude) : undefined}
                  longitude={longitude ? parseFloat(longitude) : undefined}
                  onChange={({ latitude: lat, longitude: lng, governorate: gov, area: ar, raw }) => {
                    setLatitude(String(lat));
                    setLongitude(String(lng));
                    if (raw) {
                      applyAddressFromRaw(raw);
                    } else {
                      if (gov) setGovernorate(matchGovernorate(gov) || gov);
                      if (ar) setArea(matchArea(ar, governorate) || ar);
                    }
                  }}
                  height={320}
                />
              </div>
              {(latitude && longitude) && (
                <p className="text-sm text-gray-600">Picked: {latitude}, {longitude}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Apartment</label>
              <input className="w-full input-field" value={apartment} onChange={(e) => setApartment(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor</label>
              <input className="w-full input-field" value={floor} onChange={(e) => setFloor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Door Number</label>
              <input className="w-full input-field" value={door} onChange={(e) => setDoor(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Please attach files</label>
            <p className="text-xs text-gray-500 mb-3">Pictures help identify the service or problem and provide better price offers.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-hodhod p-6 cursor-pointer hover:bg-gray-50">
                <PhotoIcon className="w-8 h-8 text-hodhod-gold mb-2" />
                <span className="text-sm">Add Photos</span>
                <input type="file" accept="image/*" capture="environment" multiple onChange={onImagesChange} className="hidden" />
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-hodhod p-6 cursor-pointer hover:bg-gray-50">
                <MicrophoneIcon className="w-8 h-8 text-hodhod-gold mb-2" />
                <span className="text-sm">Attach Voice</span>
                <input type="file" accept="audio/*" capture multiple onChange={onAudioChange} className="hidden" />
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-hodhod p-6 cursor-pointer hover:bg-gray-50">
                <VideoCameraIcon className="w-8 h-8 text-hodhod-gold mb-2" />
                <span className="text-sm">Add Videos</span>
                <input type="file" accept="video/*" capture multiple onChange={onVideoChange} className="hidden" />
              </label>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                className={`btn-outline ${isRecording ? '!bg-red-50 !border-red-300' : ''}`}
              >
                {isRecording ? 'Recording... release to send' : 'Hold to record voice'}
              </button>
              <p className="text-xs text-gray-500 mt-1">Your browser will ask for microphone access when recording for the first time.</p>
            </div>
            {!!attachments.length && (
              <p className="text-sm text-gray-600 mt-2">{attachments.length} file(s) uploaded and will be sent with your request.</p>
            )}
          </div>

          {/* Save to profile option */}
          <div className="flex items-center gap-2">
            <input id="saveToProfile" type="checkbox" checked={saveToProfile} onChange={(e)=>setSaveToProfile(e.target.checked)} />
            <label htmlFor="saveToProfile" className="text-sm">Save this address to my profile</label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</button>
            <Link to="/services" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}


