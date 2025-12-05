import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import OpportunityDetail from './components/OpportunityDetail';
import AllOpportunities from './components/AllOpportunities';
import PersonalizedRoadmap from './components/PersonalizedRoadmap';
import OpportunityRoadmap from './components/OpportunityRoadmap';
import SettingsMenu from './components/SettingsMenu';
import EditProfileScreen from './components/EditProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import PrivacyScreen from './components/PrivacyScreen';
import HelpScreen from './components/HelpScreen';
import CVManagement from './components/CVManagement';
import AddGoalScreen from './components/AddGoalScreen';
import CommunityMarketplace from './components/CommunityMarketplace';
import IntroductionPopup from './components/IntroductionPopup';
import AllGoals from './components/AllGoals';
import AchievementsScreen from './components/AchievementsScreen';
import { useDarkMode } from './hooks/useDarkMode';
import { Goal, useGoals } from './hooks/useGoals';
import { authService, getProfileFromUser, isNewUser } from './lib/auth';
import { useAnalytics } from './hooks/useAnalytics';
import type { Opportunity } from './types/opportunity';
import type { AppUser } from './types/user';
import type { OnboardingProfileData, OnboardingState } from './types/onboarding';
import { fetchUserProfile, hasCompletedOnboarding, saveOnboardingProfile, extractOnboardingState } from './services/profile';

export type Screen = 'landing' | 'auth' | 'chat' | 'dashboard' | 'all-goals' | 'profile' | 'opportunity-detail' | 'all-opportunities' | 'roadmap' | 'opportunity-roadmap' | 'settings' | 'profile-edit' | 'notifications' | 'privacy' | 'help' | 'cv-management' | 'add-goal' | 'community-marketplace' | 'achievements';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [user, setUser] = useState<AppUser | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showIntroPopup, setShowIntroPopup] = useState(false);
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const [manualOnboardingTrigger, setManualOnboardingTrigger] = useState(false);
  const { goals, createGoal } = useGoals();
  const { isDarkMode } = useDarkMode();
  const { recordOpportunityExplored } = useAnalytics();

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
          setCurrentScreen((previous) => (previous === 'landing' ? 'dashboard' : previous));
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
        }

        setCurrentScreen((previous) => (previous === 'auth' || previous === 'landing' ? 'dashboard' : previous));
      } else {
        setUser(null);
        setSelectedGoalId(null);
        setOnboardingState(null);
        setManualOnboardingTrigger(false);
        setHasDismissedOnboarding(false);
        setShowIntroPopup(false);
        setCurrentScreen('landing');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setHasDismissedOnboarding(false);
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
        const session = await authService.getSession();
        const currentUser = session?.user || null;

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

        if (!manualOnboardingTrigger) {
          // Show the intro popup only for:
          // 1. New users who haven't completed onboarding yet, OR
          // 2. Users who haven't completed onboarding and are coming back (with error fallback)
          // Check if user is new using the helper function
          const isActuallyNew = isNewUser(profile, currentUser);
          const shouldAutoShow = (!onboarding?.completed && isActuallyNew) ||
                                (!onboarding?.completed && !hasDismissedOnboarding && !profile);
          setShowIntroPopup(shouldAutoShow);
        }
      } catch (error) {
        console.error('Failed to load onboarding status', error);
        if (isActive) {
          setOnboardingState(null);
          if (!manualOnboardingTrigger) {
            // If we can't determine onboarding status, we still want to prevent the popup
            // from appearing on every login for existing users
            setShowIntroPopup(false);
          }
        }
      }
    };

    void evaluateOnboarding();

    return () => {
      isActive = false;
    };
  }, [user?.id, hasDismissedOnboarding, manualOnboardingTrigger]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStarted = (userData?: AppUser) => {
    scrollToTop();
    if (userData) {
      setUser(userData);
    } else {
      setCurrentScreen('auth');
    }
  };

  const handleAuthSuccess = (userData: AppUser) => {
    scrollToTop();
    setUser(userData);
  };

  const handleRedoOnboarding = () => {
    if (!user) {
      return;
    }
    setHasDismissedOnboarding(false);
    setManualOnboardingTrigger(true);
    setShowIntroPopup(true);
  };

  const handleIntroComplete = async (profileData: OnboardingProfileData | null) => {
    setHasDismissedOnboarding(true);
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
    setCurrentScreen('dashboard');
  };

  const handleOpportunitySelect = (opportunity: Opportunity) => {
    scrollToTop();
    void recordOpportunityExplored({
      id: opportunity.id,
      title: opportunity.title,
      category: opportunity.category
    });
    setSelectedOpportunity(opportunity);
    setCurrentScreen('opportunity-detail');
  };

  const handleAddToGoals = (opportunity: Opportunity) => {
    scrollToTop();
    setSelectedOpportunity(opportunity);
    setCurrentScreen('opportunity-roadmap');
  };

  const handleGoalClick = (goalId: string) => {
    scrollToTop();
    setSelectedGoalId(goalId);
    setCurrentScreen('roadmap');
  };

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
        setHasDismissedOnboarding(false);
        setCurrentScreen('landing');
      }
    };

  const handleNavigate = (screen: Screen | string) => {
    scrollToTop();
    setCurrentScreen(screen as Screen);
  };

  const handleBack = (targetScreen: Screen) => {
    scrollToTop();
    setCurrentScreen(targetScreen);
  };

  const handleAddGoal = () => {
    scrollToTop();
    setCurrentScreen('add-goal');
  };

  const handleViewAllGoals = () => {
    scrollToTop();
    setCurrentScreen('all-goals');
  };

  const handleGoalCreated = (goal: Goal) => {
    scrollToTop();
    setSelectedGoalId(goal.id);
    if (goal.source === 'template') {
      setCurrentScreen('roadmap');
      return;
    }
    setCurrentScreen('dashboard');
  };

  const handleCommunityRoadmapSelect = (roadmap: any) => {
    scrollToTop();
    const existingGoal = goals.find((goal) => goal.templateId === roadmap.id);
    const goal =
      existingGoal ||
      createGoal({
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        source: 'template',
        templateId: roadmap.id,
        progress: 0
      });
    setSelectedGoalId(goal.id);
    setCurrentScreen('roadmap');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <LandingPage onGetStarted={() => handleGetStarted()} />;
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'chat':
        return <ChatInterface user={user} />;
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            onOpportunityClick={handleOpportunitySelect}
            onViewAllOpportunities={() => handleNavigate('all-opportunities')}
            onGoalClick={handleGoalClick}
            onNavigate={handleNavigate}
            onAddGoal={handleAddGoal}
            onViewAllGoals={handleViewAllGoals}
            onboardingProfile={onboardingState?.data ?? null}
            onRedoOnboarding={handleRedoOnboarding}
          />
        );
      case 'profile':
        return (
          <Profile 
            user={user} 
            setUser={setUser}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case 'opportunity-detail':
        if (!selectedOpportunity) {
          return (
            <AllOpportunities
              onBack={() => handleBack('dashboard')}
              onSelectOpportunity={handleOpportunitySelect}
            />
          );
        }
        return (
          <OpportunityDetail
            opportunity={selectedOpportunity}
            onBack={() => handleBack('dashboard')}
            onAddToGoals={handleAddToGoals}
          />
        );
      case 'all-goals':
        return (
          <AllGoals
            onBack={() => handleBack('dashboard')}
            onSelectGoal={handleGoalClick}
            onAddGoal={handleAddGoal}
          />
        );
      case 'all-opportunities':
        return (
          <AllOpportunities
            onBack={() => handleBack('dashboard')}
            onSelectOpportunity={handleOpportunitySelect}
          />
        );
      case 'roadmap':
        return (
          <PersonalizedRoadmap 
            onBack={() => handleBack('dashboard')}
            goalId={selectedGoalId ?? undefined}
            onboardingProfile={onboardingState?.data ?? null}
            onRedoOnboarding={handleRedoOnboarding}
          />
        );
      case 'opportunity-roadmap':
        if (!selectedOpportunity) {
          return (
            <AllOpportunities
              onBack={() => handleBack('dashboard')}
              onSelectOpportunity={handleOpportunitySelect}
            />
          );
        }
        return (
          <OpportunityRoadmap
            onBack={() => handleBack('dashboard')}
            opportunity={selectedOpportunity}
          />
        );
      case 'settings':
        return (
          <SettingsMenu
            onBack={() => handleBack('profile')}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onRedoOnboarding={handleRedoOnboarding}
            onboardingProfile={onboardingState?.data ?? null}
          />
        );
      case 'profile-edit':
        return (
          <EditProfileScreen
            user={user}
            setUser={setUser}
            onBack={() => handleBack('settings')}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={() => handleBack('settings')}
          />
        );
      case 'privacy':
        return (
          <PrivacyScreen
            onBack={() => handleBack('settings')}
          />
        );
      case 'help':
        return (
          <HelpScreen
            onBack={() => handleBack('settings')}
            user={user}
          />
        );
      case 'cv-management':
        return (
          <CVManagement
            onBack={() => handleBack('profile')}
          />
        );
      case 'add-goal':
        return (
          <AddGoalScreen
            onBack={() => handleBack('dashboard')}
            onGoalCreated={handleGoalCreated}
            onNavigate={handleNavigate}
            user={user}
          />
        );
      case 'community-marketplace':
        return (
          <CommunityMarketplace
            onBack={() => handleBack('dashboard')}
            onRoadmapSelect={handleCommunityRoadmapSelect}
            user={user}
          />
        );
      case 'achievements':
        return (
          <AchievementsScreen
            onBack={() => handleBack('dashboard')}
          />
        );
      default:
        return <LandingPage onGetStarted={() => handleGetStarted()} />;
    }
  };

  const showNavigation = currentScreen !== 'landing' && 
                        currentScreen !== 'auth' && 
                        !['opportunity-detail', 'roadmap', 'opportunity-roadmap', 'settings', 'profile-edit', 'notifications', 'privacy', 'help', 'cv-management', 'add-goal', 'community-marketplace'].includes(currentScreen);

  return (
    <div className={`min-h-screen bg-surface-body text-strong transition-theme ${isDarkMode ? 'dark' : ''}`}>
      {showNavigation && (
        <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
      <main className={`${showNavigation ? 'pb-20 lg:pb-24' : ''} transition-theme`}>
        {renderScreen()}
      </main>
      
      {/* Introduction Popup */}
      {showIntroPopup && user && (
        <IntroductionPopup
          isOpen={showIntroPopup}
          onComplete={handleIntroComplete}
          userName={user.name}
          initialData={onboardingState?.data ?? null}
        />
      )}
    </div>
  );
}

export { App as default };
