import React, { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, BookOpen, Briefcase, Heart, Globe } from 'lucide-react';
import Button from './ui/Button';
import { useDarkMode } from '../hooks/useDarkMode';
import type { OnboardingProfileData } from '../types/onboarding';

interface IntroductionPopupProps {
  isOpen: boolean;
  onComplete: (userData: OnboardingProfileData | null) => void | Promise<void>;
  userName: string;
  initialData?: OnboardingProfileData | null;
}

interface IntroductionFormData {
  fullName: string;
  age: string;
  courseOfStudy: string;
  interests: string[];
  goals: string[];
  experience: string;
  location: string;
  education: string;
  preferredLearning: string[];
}

const createInitialFormData = (data: OnboardingProfileData | null | undefined, fallbackName: string): IntroductionFormData => ({
  fullName: data?.fullName ?? fallbackName,
  age: data?.age !== null && data?.age !== undefined ? String(data.age) : '',
  courseOfStudy: data?.courseOfStudy ?? '',
  interests: [...(data?.interests ?? [])],
  goals: [...(data?.goals ?? [])],
  experience: data?.experience ?? '',
  location: data?.location ?? '',
  education: data?.educationLevel ?? '',
  preferredLearning: [...(data?.preferredLearning ?? [])]
});

const IntroductionPopup: React.FC<IntroductionPopupProps> = ({ isOpen, onComplete, userName, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntroductionFormData>(() => createInitialFormData(initialData, userName));
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setFormData(createInitialFormData(initialData, userName));
    setCurrentStep(0);
  }, [initialData, isOpen, userName]);

  const steps = [
    {
      title: "Welcome to Edutu!",
      subtitle: `Hi ${userName}! I'm your AI opportunity coach`,
      content: "welcome"
    },
    {
      title: "Let's get to know you",
      subtitle: "Share a few essentials so we can tailor your experience",
      content: "basics"
    },
    {
      title: "What interests you most?",
      subtitle: "Select all that apply - this helps me find the best opportunities for you",
      content: "interests"
    },
    {
      title: "What are your main goals?",
      subtitle: "Choose your primary objectives so I can create personalized roadmaps",
      content: "goals"
    },
    {
      title: "Tell me about your background",
      subtitle: "This helps me understand your starting point and recommend appropriate opportunities",
      content: "background"
    },
    {
      title: "How do you prefer to learn?",
      subtitle: "I'll customize your experience based on your learning style",
      content: "learning"
    },
    {
      title: "Perfect! Let's get started",
      subtitle: "I'm analyzing your profile to find the best opportunities for you",
      content: "completion"
    }
  ];

  const interestOptions = [
    { id: 'technology', label: 'Technology & Programming', icon: '💻' },
    { id: 'business', label: 'Business & Entrepreneurship', icon: '💼' },
    { id: 'education', label: 'Education & Research', icon: '🎓' },
    { id: 'healthcare', label: 'Healthcare & Medicine', icon: '🏥' },
    { id: 'arts', label: 'Arts & Creative Fields', icon: '🎨' },
    { id: 'science', label: 'Science & Engineering', icon: '🔬' },
    { id: 'social', label: 'Social Impact & NGOs', icon: '🌍' },
    { id: 'finance', label: 'Finance & Economics', icon: '💰' }
  ];

  const goalOptions = [
    { id: 'scholarship', label: 'Get Scholarships', icon: '🎓' },
    { id: 'job', label: 'Find Job Opportunities', icon: '💼' },
    { id: 'skills', label: 'Develop New Skills', icon: '📚' },
    { id: 'network', label: 'Build Professional Network', icon: '🤝' },
    { id: 'startup', label: 'Start a Business', icon: '🚀' },
    { id: 'leadership', label: 'Develop Leadership', icon: '👑' },
    { id: 'research', label: 'Pursue Research', icon: '🔍' },
    { id: 'travel', label: 'Study/Work Abroad', icon: '✈️' }
  ];

  const learningOptions = [
    { id: 'visual', label: 'Visual Learning', icon: '👁️', desc: 'Charts, diagrams, videos' },
    { id: 'hands-on', label: 'Hands-on Practice', icon: '🛠️', desc: 'Projects and exercises' },
    { id: 'reading', label: 'Reading & Research', icon: '📖', desc: 'Articles and documentation' },
    { id: 'community', label: 'Community Learning', icon: '👥', desc: 'Group discussions and forums' },
    { id: 'mentorship', label: 'One-on-One Mentorship', icon: '🎯', desc: 'Personal guidance' },
    { id: 'structured', label: 'Structured Courses', icon: '📋', desc: 'Step-by-step curriculum' }
  ];

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }));
  };

  const handleFieldChange =
    (field: keyof IntroductionFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setFormData((previous) => ({
        ...previous,
        [field]: value
      }));
    };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((previous) => previous + 1);
      return;
    }

    const parsedAge = Number.parseInt(formData.age.trim(), 10);
    const sanitizedData: OnboardingProfileData = {
      fullName: formData.fullName.trim(),
      age: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : null,
      courseOfStudy: formData.courseOfStudy.trim(),
      interests: [...formData.interests],
      goals: [...formData.goals],
      educationLevel: formData.education.trim(),
      location: formData.location.trim(),
      experience: formData.experience.trim(),
      preferredLearning: [...formData.preferredLearning]
    };

    onComplete(sanitizedData);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const currentContent = steps[currentStep]?.content;
    switch (currentContent) {
      case 'welcome':
        return true;
      case 'basics': {
        const ageValue = Number.parseInt(formData.age.trim(), 10);
        return (
          Boolean(formData.fullName.trim()) &&
          Boolean(formData.courseOfStudy.trim()) &&
          Number.isFinite(ageValue) &&
          ageValue > 0
        );
      }
      case 'interests':
        return formData.interests.length > 0;
      case 'goals':
        return formData.goals.length > 0;
      case 'background':
        return Boolean(formData.experience.trim() && formData.location.trim() && formData.education.trim());
      case 'learning':
        return formData.preferredLearning.length > 0;
      case 'completion':
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.content) {
        case 'welcome':
          return (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                <Sparkles size={40} className="text-white" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              I'm here to help you discover amazing opportunities and create personalized roadmaps to achieve your goals. 
              Let's get to know each other better so I can provide the best guidance for your journey!
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Target size={16} className="text-primary" />
                <span>Personalized recommendations</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <BookOpen size={16} className="text-accent" />
                <span>Custom learning paths</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Briefcase size={16} className="text-green-600" />
                <span>Career opportunities</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Heart size={16} className="text-red-500" />
                <span>Ongoing support</span>
              </div>
              </div>
            </div>
          );

        case 'basics':
          return (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleFieldChange('fullName')}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={formData.age}
                    onChange={handleFieldChange('age')}
                    placeholder="How old are you?"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course of study
                  </label>
                  <input
                    type="text"
                    value={formData.courseOfStudy}
                    onChange={handleFieldChange('courseOfStudy')}
                    placeholder="e.g., Computer Science"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          );

      case 'interests':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelect('interests', option.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                    formData.interests.includes(option.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goalOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelect('goals', option.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                    formData.goals.includes(option.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Education Level
              </label>
              <select
                value={formData.education}
                onChange={handleFieldChange('education')}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select your education level</option>
                <option value="high-school">High School</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="other">Other</option>
              </select>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (Country/City)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={handleFieldChange('location')}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Lagos, Nigeria"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select
                value={formData.experience}
                onChange={handleFieldChange('experience')}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select your experience level</option>
                <option value="beginner">Beginner (Just starting out)</option>
                <option value="intermediate">Intermediate (Some experience)</option>
                <option value="advanced">Advanced (Experienced)</option>
                <option value="expert">Expert (Highly experienced)</option>
              </select>
            </div>
          </div>
        );

      case 'learning':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {learningOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleMultiSelect('preferredLearning', option.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                    formData.preferredLearning.includes(option.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm opacity-75">{option.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
              <Globe size={40} className="text-white" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Perfect! I now have everything I need to provide you with personalized recommendations. 
              Your dashboard is being prepared with opportunities and roadmaps tailored just for you.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-4 rounded-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Ready to explore:</strong> {formData.interests.length} interest areas, {formData.goals.length} goals, and personalized learning paths
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl animate-fade-in ${isDarkMode ? 'dark' : ''}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{steps[currentStep].title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{steps[currentStep].subtitle}</p>
            </div>
            {/* Remove close button for new users to make it compulsory, keep for existing users */}
            {currentStep === 0 && initialData === null && (
              <div className="p-2 rounded-full">
                <X size={20} className="text-transparent" /> {/* Invisible placeholder for alignment */}
              </div>
            )}
            {currentStep === 0 && initialData !== null && (
              <button
                onClick={() => onComplete(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 overflow-hidden rounded-full bg-neutral-200/70 dark:bg-neutral-700/40 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400 shadow-[0_8px_24px_-14px_rgba(6,182,212,0.85)] transition-[width] duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPopup;




