import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function UserPublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${base}/users/public/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch user');
        if (mounted) setProfile(data.data);
      } catch (e) {
        setError(e.message || 'Failed to fetch user');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="container-hodhod py-8"><div className="animate-pulse h-40 bg-gray-100 rounded" /></div>;
  if (error) return <div className="container-hodhod py-8 text-red-600">{error}</div>;
  if (!profile) return null;

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-hodhod py-8">
        <div className="bg-white rounded-hodhod shadow-hodhod p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-hodhod-gold to-hodhod-gold-dark text-white flex items-center justify-center text-lg font-semibold overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt={fullName} className="w-16 h-16 object-cover" />
            ) : (
              (fullName || 'U').slice(0,1)
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-hodhod-black">{fullName}</h1>
            <div className="text-sm text-gray-600">
              {profile.governorate || ''} {profile.area ? `• ${profile.area}` : ''}
            </div>
          </div>
          {profile.role === 'provider' && (
            <Link to={`/providers/${profile.id}`} className="btn-outline">View provider page</Link>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-gray-700 whitespace-pre-line">{profile.bio || '—'}</p>
          </div>
          <div className="bg-white rounded-hodhod shadow-hodhod p-6">
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <p className="text-gray-600 text-sm">For privacy, direct contact info is hidden. Use in-app chat where available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


