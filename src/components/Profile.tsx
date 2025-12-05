import React, { useEffect, useState } from 'react';
import {
  User,
  Settings,
  LogOut,
  Edit3,
  Save,
  X,
  ChevronRight,
  FileText,
  Inbox
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import NotificationInbox from './NotificationInbox';
import { Screen } from '../App';
import { useDarkMode } from '../hooks/useDarkMode';
import CVManagement from './CVManagement';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAnalytics } from '../hooks/useAnalytics';
import { useNotifications } from '../hooks/useNotifications';
import type { AppUser } from '../types/user';

interface ProfileProps {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

type StoredProfileData = {
  name: string;
  age: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  interests: string;
  goals: string;
};

const PROFILE_STORAGE_DEFAULT: StoredProfileData = {
  name: '',
  age: '',
  email: 'user@example.com',
  phone: '+234 123 456 7890',
  location: 'Lagos, Nigeria',
  bio: 'Passionate about technology and personal growth. Always looking for new opportunities to learn and make an impact.',
  interests: 'Technology, Entrepreneurship, Education',
  goals: 'Complete Python Course, Apply to Scholarships, Build Portfolio'
};

const Profile: React.FC<ProfileProps> = ({ user, setUser, onNavigate, onLogout }) => {
  const [storedProfile, setStoredProfile] = usePersistentState<StoredProfileData>('profile.formData', PROFILE_STORAGE_DEFAULT);
  const [profileImage] = usePersistentState<string | null>('profile.profileImage', null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || storedProfile.name || '');
  const [editAge, setEditAge] = useState(user?.age !== undefined ? user.age.toString() : storedProfile.age || '');
  const [bio, setBio] = useState(storedProfile.bio || PROFILE_STORAGE_DEFAULT.bio);
  const [showCVManagement, setShowCVManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();
  const { isDarkMode } = useDarkMode();
  const { stats: analyticsStats } = useAnalytics();

  useEffect(() => {
    setEditName(user?.name || storedProfile.name || '');
    setEditAge(user?.age !== undefined ? user.age.toString() : storedProfile.age || '');
  }, [user, storedProfile.name, storedProfile.age]);

  useEffect(() => {
    setBio(storedProfile.bio || PROFILE_STORAGE_DEFAULT.bio);
  }, [storedProfile.bio]);

  const handleSave = () => {
    if (editName && editAge) {
      if (user) {
        const parsedAge = Number.parseInt(editAge, 10);
        const nextUser: AppUser = { ...user, name: editName };
        if (Number.isFinite(parsedAge)) {
          nextUser.age = parsedAge;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (nextUser as { age?: number }).age;
        }
        setUser(nextUser);
      }
      setStoredProfile((prev) => ({
        ...prev,
        name: editName,
        age: editAge
      }));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(user?.name || '');
    setEditAge(user?.age !== undefined ? user.age.toString() : '');
    setIsEditing(false);
  };

  const stats = [
    { label: 'Opportunities Explored', value: analyticsStats.opportunitiesExplored.toLocaleString() },
    { label: 'Goals Achieved', value: analyticsStats.goalsAchieved.toLocaleString() },
    { label: 'Days Active', value: analyticsStats.daysActive.toLocaleString() },
    { label: 'Chat Sessions', value: analyticsStats.chatSessions.toLocaleString() }
  ];

  const settingsOptions = [
    {
      id: 'settings' as Screen,
      title: 'Settings & Preferences',
      description: 'Manage your account settings',
      icon: <Settings size={20} className="text-primary" />
    }
  ];

  const displayName = user?.name || storedProfile.name || 'Your Name';
  const displayAge = user?.age ?? (storedProfile.age ? parseInt(storedProfile.age, 10) : null);

  if (showCVManagement) {
    return <CVManagement onBack={() => setShowCVManagement(false)} />;
  }

  return (
    <div className={`p-4 space-y-6 animate-fade-in pb-24 bg-white dark:bg-gray-900 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Profile Header */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          
          {!isEditing ? (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{displayName}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {displayAge !== null && !Number.isNaN(displayAge) ? `${displayAge} years old` : 'Age not set'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto leading-relaxed">{bio}</p>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Edit3 size={16} />
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 text-center text-xl font-bold rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  min="16"
                  max="30"
                  className="w-full px-4 py-2 text-center rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your age"
                />
              </div>
              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 text-center rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCancel} variant="secondary" className="flex-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={!editName || !editAge}>
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="text-center animate-slide-up dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Inbox Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => setShowNotifications(true)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-600 dark:to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox size={24} className="text-purple-600 dark:text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Inbox</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                New
              </div>
            )}
            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>

      {/* CV Management - Simplified */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => setShowCVManagement(true)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} className="text-primary dark:text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">CV Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload, optimize, and enhance your CV</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
              All Tools
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>

      {/* Settings Menu */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Settings & Preferences</h2>
        <div className="space-y-1">
          {settingsOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onNavigate(option.id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-gray-50 dark:hover:bg-gray-700 text-left animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-white">{option.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </Card>

      {/* Sign Out */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 shadow-sm">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 group"
        >
          <LogOut size={20} className="text-red-500" />
          <div className="flex-1 text-left">
            <div className="font-medium">Sign Out</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Log out of your account</div>
          </div>
          <ChevronRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </Card>

      {/* App Info */}
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm space-y-1 pt-4">
        <p>Edutu v1.0</p>
        <p>Empowering African youth since 2024</p>
        <p className="text-xs">Made with ❤️ for ambitious dreamers</p>
      </div>

      {/* Notification Inbox */}
      <NotificationInbox 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default Profile;
