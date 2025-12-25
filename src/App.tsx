import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import { useSwipe } from './hooks/useSwipe';
import LoadingFallback from './components/ui/LoadingFallback';
import { PWAInstallBanner } from './hooks/usePWA';

// Core components - loaded immediately
import LandingPage from './components/LandingPageV3';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import NotFoundPage from './components/NotFoundPage';
import IntroductionPopup from './components/IntroductionPopup';

// Lazy-loaded components - loaded on demand for better performance
const ChatInterface = lazy(() => import('./components/ChatInterface'));
const Profile = lazy(() => import('./components/Profile'));
const OpportunityDetail = lazy(() => import('./components/OpportunityDetail'));
const AllOpportunities = lazy(() => import('./components/AllOpportunities'));
const PersonalizedRoadmap = lazy(() => import('./components/PersonalizedRoadmap'));
const OpportunityRoadmap = lazy(() => import('./components/OpportunityRoadmap'));
const SettingsMenu = lazy(() => import('./components/SettingsMenu'));
const EditProfileScreen = lazy(() => import('./components/EditProfileScreen'));
const NotificationsScreen = lazy(() => import('./components/NotificationsScreen'));
const PrivacyScreen = lazy(() => import('./components/PrivacyScreen'));
const HelpScreen = lazy(() => import('./components/HelpScreen'));
const CVManagement = lazy(() => import('./components/CVManagement'));
const AddGoalScreen = lazy(() => import('./components/AddGoalScreen'));
const CommunityMarketplace = lazy(() => import('./components/CommunityMarketplace'));
const PersonalizationProfileScreen = lazy(() => import('./components/PersonalizationProfileScreen'));
const AllGoals = lazy(() => import('./components/AllGoals'));
const AchievementsScreen = lazy(() => import('./components/AchievementsScreen'));
const PackageDetail = lazy(() => import('./components/PackageDetail'));
const AdminRoot = lazy(() => import('./admin/AdminRoot'));
import { useDarkMode } from './hooks/useDarkMode';
import { Goal, useGoals } from './hooks/useGoals';
import { authService, getProfileFromUser, isNewUser } from './lib/auth';
import { useAnalytics } from './hooks/useAnalytics';
import { initializeCapacitor, configureStatusBar, isNativePlatform } from './lib/capacitor';
import type { Opportunity } from './types/opportunity';
import type { AppUser } from './types/user';
import type { OnboardingProfileData, OnboardingState } from './types/onboarding';
import type { CommunityStory } from './types/community';
import { fetchUserProfile, saveOnboardingProfile, extractOnboardingState } from './services/profile';

export type Screen = 'landing' | 'auth' | 'chat' | 'dashboard' | 'all-goals' | 'profile' | 'opportunity-detail' | 'all-opportunities' | 'roadmap' | 'opportunity-roadmap' | 'settings' | 'profile-edit' | 'notifications' | 'privacy' | 'help' | 'cv-management' | 'add-goal' | 'community-marketplace' | 'achievements' | 'package-detail' | 'personalization';

import type { DashboardRef } from './components/Dashboard';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedCommunityStory, setSelectedCommunityStory] = useState<CommunityStory | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null); // Store selected package ID
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [manualOnboardingTrigger, setManualOnboardingTrigger] = useState(false);
  const dashboardRef = useRef<DashboardRef>(null);
  const { goals, createGoal } = useGoals();
  const { isDarkMode } = useDarkMode();
  const { recordOpportunityExplored } = useAnalytics();

  // Initialize Capacitor for Android/iOS
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      // Handle OAuth callback
      if (url.includes('auth') || url.includes('callback')) {
        try {
          const sessionData = await authService.handleOAuthCallback(url);
          if (sessionData?.session?.user) {
            const profile = getProfileFromUser(sessionData.session.user);
            if (profile) {
              setUser(profile);
              setShowSplash(true);
              navigate('/app/home');
            }
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
    };

    const handleBackButton = (): boolean => {
      // Return true if we handled the back action
      if (showIntroPopup) {
        setShowIntroPopup(false);
        return true;
      }
      if (showSplash) {
        setShowSplash(false);
        return true;
      }
      return false;
    };

    initializeCapacitor({
      onBackButton: handleBackButton,
      onDeepLink: handleDeepLink,
      isDarkMode
    });
  }, [navigate, showIntroPopup, showSplash, isDarkMode]);

  // Update status bar when dark mode changes
  useEffect(() => {
    if (isNativePlatform) {
      configureStatusBar(isDarkMode);
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    scrollToTop();
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Failed to sign out from Supabase', error);
    } finally {
      setUser(null);
      setSelectedGoalId(null);
      setSelectedOpportunity(null);
      setShowIntroPopup(false);
      setShowSplash(false);
      navigate('/');
    }
  };

  const handleGetStarted = (userData?: any) => {
    scrollToTop();
    if (userData && typeof userData === 'object' && 'id' in userData) {
      setUser(userData);
      navigate('/app/home');
    } else {
      if (user) {
        navigate('/app/home');
      } else {
        navigate('/auth');
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const session = await authService.getSession();
        if (!isMounted || !session?.user) {
          return;
        }

        const profile = getProfileFromUser(session.user);
        if (profile) {
          setUser(profile);

          // Check if this is a new signup by looking at URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const isSignup = urlParams.get('signup') === 'true';

          // If this is a new signup, we may want to trigger onboarding
          if (isSignup) {
            navigate('/app/home');
            try {
              const profileData = await fetchUserProfile(session.user.id);
              const isActuallyNew = isNewUser(profileData, session.user ?? null);
              if (isActuallyNew && (!profileData?.preferences?.onboarding?.completed)) {
                setShowIntroPopup(true);
              }
            } catch (onboardingError) {
              console.error('Error checking onboarding status', onboardingError);
              setShowIntroPopup(true);
            }
          } else {
            if (location.pathname === '/' || location.pathname === '/auth') {
              navigate('/app/home');
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore Supabase session', error);
      }
    };

    restoreSession();

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        const profile = getProfileFromUser(session.user);
        if (profile) {
          setUser(profile);

          // Check if this is a new signup by looking at URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const isSignup = urlParams.get('signup') === 'true';

          if (isSignup) {
            navigate('/app/home');
            setTimeout(async () => {
              try {
                const profileData = await fetchUserProfile(session.user.id);
                const isActuallyNew = isNewUser(profileData, session.user ?? null);
                if (isActuallyNew && (!profileData?.preferences?.onboarding?.completed)) {
                  setShowIntroPopup(true);
                }
              } catch (onboardingError) {
                console.error('Error checking onboarding status', onboardingError);
                setShowIntroPopup(true);
              }
            }, 500);
          } else {
            if (location.pathname === '/' || location.pathname === '/auth') {
              navigate('/app/home');
            }
          }
        }
      } else {
        setUser(null);
        setSelectedGoalId(null);
        setOnboardingState(null);
        setManualOnboardingTrigger(false);
        setShowIntroPopup(false);
        navigate('/');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setManualOnboardingTrigger(false);
    setOnboardingState(null);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setShowIntroPopup(false);
      setOnboardingState(null);
      return;
    }

    let isActive = true;

    const evaluateOnboarding = async () => {
      try {
        const profile = await fetchUserProfile(user.id);

        if (!isActive) {
          return;
        }

        const onboarding = extractOnboardingState(profile);
        setOnboardingState((previous) => {
          if (!onboarding && !previous) {
            return previous;
          }
          if (onboarding && previous) {
            const sameCompletion = previous.completed === onboarding.completed;
            const sameData =
              JSON.stringify(previous.data) === JSON.stringify(onboarding.data);
            if (sameCompletion && sameData) {
              return previous;
            }
          }
          return onboarding ?? null;
        });

        // IMPORTANT: We DO NOT auto-show the popup here anymore.
        // The popup is only shown when:
        // 1. manualOnboardingTrigger is true (user clicked "Redo Onboarding" in settings)
        // 2. A new signup was detected via URL parameter (handled in the auth state change effect)
        // This prevents the popup from appearing on every page refresh.

        if (manualOnboardingTrigger) {
          // Only show if manually triggered
          setShowIntroPopup(true);
        }
        // For returning users, we respect their previous onboarding completion.
        // If they dismissed or completed onboarding before, don't show it again automatically.

      } catch (error) {
        console.error('Failed to load onboarding status', error);
        if (isActive) {
          setOnboardingState(null);
          // Don't auto-show popup on error - user can manually trigger from settings
        }
      }
    };

    void evaluateOnboarding();

    return () => {
      isActive = false;
    };
  }, [user?.id, manualOnboardingTrigger]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = useCallback((userData: AppUser) => {
    // Prevent multiple calls
    if (user?.id === userData.id) {
      return;
    }

    scrollToTop();
    setUser(userData);

    // Clean up signup parameter from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]signup=true/, '');
      window.history.replaceState({}, document.title, newUrl);
    }

    // Reset onboarding flags
    setManualOnboardingTrigger(false);

    // Show splash screen and navigate to home
    setShowSplash(true);
    navigate('/app/home');
  }, [user?.id, navigate]);

  const handleRedoOnboarding = () => {
    if (!user) {
      return;
    }
    // Navigate to the personalization profile page instead of showing popup
    navigate('/app/personalization');
  };

  const handleIntroComplete = async (profileData: OnboardingProfileData | null) => {
    setManualOnboardingTrigger(false);

    if (user?.id && profileData) {
      const trimmedName = profileData.fullName.trim();
      const trimmedCourse = profileData.courseOfStudy.trim();

      try {
        const savedState = await saveOnboardingProfile(user.id, profileData);
        setOnboardingState(savedState);
        setUser((previous) => {
          if (!previous) {
            return previous;
          }

          const nextUser: AppUser = {
            ...previous,
            ...(trimmedName ? { name: trimmedName } : {})
          };

          if (profileData.age !== null) {
            nextUser.age = profileData.age;
          }

          if (trimmedCourse) {
            nextUser.courseOfStudy = trimmedCourse;
          }

          return nextUser;
        });
      } catch (error) {
        console.error('Failed to save onboarding details', error);
      }
    }

    setShowIntroPopup(false);
    navigate('/app/home');
  };

  const handleOpportunitySelect = (opportunity: Opportunity) => {
    scrollToTop();
    void recordOpportunityExplored({
      id: opportunity.id,
      title: opportunity.title,
      category: opportunity.category
    });
    setSelectedOpportunity(opportunity);
    navigate(`/app/opportunity/${opportunity.id}`);
  };

  const handleAddToGoals = (opportunity: Opportunity) => {
    scrollToTop();
    setSelectedOpportunity(opportunity);
    navigate(`/app/opportunity/${opportunity.id}/roadmap`);
  };

  const handleGoalClick = (goalId: string) => {
    scrollToTop();
    setSelectedGoalId(goalId);
    navigate(`/app/goal/${goalId}/roadmap`);
  };

  const handleNavigate = (screen: string) => {
    scrollToTop();
    if (screen === 'logout') {
      handleLogout();
    } else {
      const pathMap: Record<string, string> = {
        'landing': '/',
        'auth': '/auth',
        'dashboard': '/app/home',
        'all-opportunities': '/app/opportunities',
        'chat': '/app/chat',
        'profile': '/app/profile',
        'all-goals': '/app/goals',
        'community-marketplace': '/app/community',
        'achievements': '/app/achievements',
        'settings': '/app/settings',
        'cv-management': '/app/cv',
        'add-goal': '/app/add-goal'
      };
      navigate(pathMap[screen] || `/app/${screen}`);
    }
  };

  const handleBack = (fallback: string = 'dashboard') => {
    scrollToTop();
    // Special logic for refreshing dashboard if coming back from opportunities
    if (location.pathname.includes('/opportunities') || location.pathname.includes('/opportunity')) {
      if (dashboardRef.current) {
        dashboardRef.current.refreshOpportunities();
      }
    }

    // Default back behavior
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      handleNavigate(fallback);
    }
  };

  const handleSwipeLeft = () => {
    const mainTabs = ['/app/home', '/app/opportunities', '/app/chat', '/app/community'];
    const currentIndex = mainTabs.indexOf(location.pathname);
    if (currentIndex >= 0 && currentIndex < mainTabs.length - 1) {
      navigate(mainTabs[currentIndex + 1]);
      scrollToTop();
    }
  };

  const handleSwipeRight = () => {
    const mainTabs = ['/app/home', '/app/opportunities', '/app/chat', '/app/community'];
    const currentIndex = mainTabs.indexOf(location.pathname);
    if (currentIndex > 0) {
      navigate(mainTabs[currentIndex - 1]);
      scrollToTop();
    }
  };

  useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50
  });

  const handleGoalCreated = (goal: Goal) => {
    scrollToTop();
    setSelectedGoalId(goal.id);
    if (goal.source === 'template') {
      navigate(`/app/goal/${goal.id}/roadmap`);
    } else {
      navigate('/app/home');
    }
  };

  const handleCommunityRoadmapSelect = async (roadmap: any) => {
    scrollToTop();
    if (roadmap.id === 'mc-001' || roadmap.type === 'package') {
      setSelectedPackageId(roadmap.id);
      navigate(`/app/package/${roadmap.id}`);
    } else {
      const existingGoal = goals.find((g) => g.template_id === roadmap.id);
      let goalId = existingGoal?.id;
      if (!existingGoal) {
        const newGoal = await createGoal({
          title: roadmap.title,
          description: roadmap.description,
          category: roadmap.category,
          source: 'template',
          templateId: roadmap.id,
          progress: 0
        });
        goalId = newGoal.id;
      }
      setSelectedGoalId(goalId!);
      setSelectedCommunityStory(roadmap);
      navigate(`/app/goal/${goalId}/roadmap`);
    }
  };

  return (
    <div className={`min-h-screen bg-surface-body text-strong transition-theme ${isDarkMode ? 'dark' : ''}`}>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          userName={user?.name}
        />
      )}

      <Suspense fallback={<LoadingFallback message="Loading..." />}>
        <Routes>
          <Route path="/" element={<LandingPage onGetStarted={() => handleGetStarted()} />} />
          <Route path="/auth" element={<AuthScreen onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/admin/*" element={<AdminRoot />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="/app/home" replace />} />
            <Route path="home" element={
              <Dashboard
                ref={dashboardRef}
                user={user}
                onOpportunityClick={handleOpportunitySelect}
                onViewAllOpportunities={() => navigate('/app/opportunities')}
                onGoalClick={handleGoalClick}
                onNavigate={handleNavigate}
                onAddGoal={() => navigate('/app/add-goal')}
                onViewAllGoals={() => navigate('/app/goals')}
                onboardingProfile={onboardingState?.data ?? null}
                onRedoOnboarding={handleRedoOnboarding}
              />
            } />
            <Route path="opportunities" element={
              <AllOpportunities
                onBack={() => handleBack()}
                onSelectOpportunity={handleOpportunitySelect}
              />
            } />
            <Route path="chat" element={<ChatInterface user={user} onBack={() => handleBack()} />} />
            <Route path="profile" element={
              <Profile
                user={user}
                setUser={setUser}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
              />
            } />
            <Route path="goals" element={
              <AllGoals
                onBack={() => handleBack()}
                onSelectGoal={handleGoalClick}
                onAddGoal={() => navigate('/app/add-goal')}
              />
            } />
            <Route path="community" element={
              <CommunityMarketplace
                onBack={() => handleBack()}
                onRoadmapSelect={handleCommunityRoadmapSelect}
                user={user}
              />
            } />
            <Route path="achievements" element={<AchievementsScreen onBack={() => handleBack()} />} />
            <Route path="add-goal" element={
              <AddGoalScreen
                onBack={() => handleBack()}
                onGoalCreated={handleGoalCreated}
                onNavigate={handleNavigate}
                user={user}
              />
            } />
            <Route path="opportunity/:id" element={
              selectedOpportunity ? (
                <OpportunityDetail
                  opportunity={selectedOpportunity}
                  onBack={() => handleBack()}
                  onAddToGoals={handleAddToGoals}
                />
              ) : <Navigate to="/app/opportunities" replace />
            } />
            <Route path="opportunity/:id/roadmap" element={
              selectedOpportunity ? (
                <OpportunityRoadmap
                  onBack={() => handleBack()}
                  opportunity={selectedOpportunity}
                />
              ) : <Navigate to="/app/opportunities" replace />
            } />
            <Route path="goal/:id/roadmap" element={
              <PersonalizedRoadmap
                onBack={() => handleBack()}
                goalId={selectedGoalId ?? undefined}
                communityStory={selectedCommunityStory ?? undefined}
              />
            } />
            <Route path="package/:id" element={
              selectedPackageId ? (
                <PackageDetail
                  packageId={selectedPackageId}
                  onBack={() => handleBack('/app/community')}
                />
              ) : <Navigate to="/app/community" replace />
            } />
            <Route path="settings" element={
              <SettingsMenu
                onBack={() => handleBack('profile')}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onRedoOnboarding={handleRedoOnboarding}
                onboardingProfile={onboardingState?.data ?? null}
              />
            } />
            <Route path="profile-edit" element={
              <EditProfileScreen
                user={user}
                setUser={setUser}
                onBack={() => handleBack('settings')}
              />
            } />
            <Route path="notifications" element={<NotificationsScreen onBack={() => handleBack('settings')} />} />
            <Route path="privacy" element={<PrivacyScreen onBack={() => handleBack('settings')} />} />
            <Route path="help" element={<HelpScreen onBack={() => handleBack('settings')} user={user} />} />
            <Route path="cv" element={<CVManagement onBack={() => handleBack('profile')} />} />
            <Route path="personalization" element={
              <PersonalizationProfileScreen
                user={user}
                onBack={() => handleBack('settings')}
                onSave={(data) => {
                  setOnboardingState({ completed: true, data, completedAt: new Date().toISOString() });
                }}
              />
            } />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {showIntroPopup && user && (
        <IntroductionPopup
          isOpen={showIntroPopup}
          onComplete={handleIntroComplete}
          userName={user.name}
          initialData={onboardingState?.data ?? null}
        />
      )}

      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}

export { App as default };
