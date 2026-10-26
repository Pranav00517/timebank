import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Alert } from '../components/Alert';
import {
  User,
  MapPin,
  Mail,
  Lock,
  Save,
  Shield,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotification, setProfileNotification] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNotification, setPasswordNotification] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileNotification(null);

    try {
      const res = await api.updateProfile({
        name,
        bio,
        location,
        photoUrl,
      });

      if (res.success) {
        await refreshUser();
        setProfileNotification({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileNotification({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordNotification(null);

    if (newPassword.length < 8) {
      setPasswordNotification({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordNotification({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPasswordNotification({ type: 'success', message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setPasswordNotification({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Account Profile</h1>
        <p style={{ color: 'var(--slate-500)' }}>
          Manage your TimeBank Learn identity, contact bio, and security settings
        </p>
      </div>

      {/* Account Overview Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <img
          src={user?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-100)' }}
        />
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>{user?.name}</h2>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: user?.role === 'admin' ? 'var(--primary-100)' : 'var(--slate-100)',
                color: user?.role === 'admin' ? 'var(--primary-800)' : 'var(--slate-700)',
              }}
            >
              {user?.role}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--slate-500)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Mail size={14} /> {user?.email}
            </span>
            {user?.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={14} /> {user.location}
              </span>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'right', background: 'var(--slate-50)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
            Available Credits
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {user?.credits}
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Personal Information</h3>

        {profileNotification && (
          <Alert
            type={profileNotification.type}
            message={profileNotification.message}
            onClose={() => setProfileNotification(null)}
          />
        )}

        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="profileName">
              Full Name
            </label>
            <input
              id="profileName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profileLocation">
                City / Location
              </label>
              <input
                id="profileLocation"
                type="text"
                className="form-input"
                placeholder="e.g. Kochi, Kerala or Online"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profilePhoto">
                Profile Photo URL
              </label>
              <input
                id="profilePhoto"
                type="url"
                className="form-input"
                placeholder="https://..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profileBio">
              About You & Teaching Background
            </label>
            <textarea
              id="profileBio"
              className="form-textarea"
              rows={3}
              placeholder="Tell learners about your experience, interests, and what you enjoy teaching..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" disabled={savingProfile} className="btn btn-primary">
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form (FR-1.5) */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Security & Password</h3>

        {passwordNotification && (
          <Alert
            type={passwordNotification.type}
            message={passwordNotification.message}
            onClose={() => setPasswordNotification(null)}
          />
        )}

        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password (min 8 chars)
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmNewPassword">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                className="form-input"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" disabled={savingPassword} className="btn btn-secondary">
              <Lock size={15} /> {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
