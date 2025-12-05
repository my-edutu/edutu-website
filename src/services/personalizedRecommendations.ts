import type { AppUser } from '../types/user';
import type { Opportunity } from '../types/opportunity';

/**
 * Represents user preferences and interests for personalized recommendations
 */
export interface UserProfileForRecommendations {
  id: string;
  name?: string;
  age?: number;
  courseOfStudy?: string;
  interests: string[];
  location?: string;
  careerGoals: string[];
  experienceLevel: string; // beginner, intermediate, advanced
  preferredCategories: string[];
  availability: string; // full-time, part-time, remote, flexible
}

/**
 * Converts AppUser to UserProfileForRecommendations format
 */
export function formatUserProfileForRecommendations(
  user: AppUser,
  additionalData?: Partial<UserProfileForRecommendations>,
  onboardingData?: Partial<UserProfileForRecommendations>
): UserProfileForRecommendations {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    courseOfStudy: user.courseOfStudy,
    interests: onboardingData?.interests || additionalData?.interests || [],
    location: onboardingData?.location || additionalData?.location || '',
    careerGoals: onboardingData?.careerGoals || additionalData?.careerGoals || [],
    experienceLevel: onboardingData?.experienceLevel || additionalData?.experienceLevel || 'intermediate',
    preferredCategories: onboardingData?.preferredCategories || additionalData?.preferredCategories || [],
    availability: onboardingData?.availability || additionalData?.availability || 'flexible',
  };
}

/**
 * Calculates match score between user profile and opportunity
 */
export function calculateMatchScore(
  userProfile: UserProfileForRecommendations,
  opportunity: Opportunity
): number {
  let score = 0;
  const maxScore = 100;

  // Match course of study or interests with opportunity category
  if (userProfile.courseOfStudy?.toLowerCase().includes(opportunity.category.toLowerCase()) ||
      userProfile.interests.some(interest => 
        opportunity.category.toLowerCase().includes(interest.toLowerCase()) ||
        opportunity.title.toLowerCase().includes(interest.toLowerCase())
      )) {
    score += 30; // Significant weight for interest match
  }

  // Match location preference
  if (userProfile.location) {
    if (opportunity.location.toLowerCase().includes(userProfile.location.toLowerCase()) ||
        opportunity.location.toLowerCase() === 'remote' && userProfile.availability.includes('remote')) {
      score += 15;
    }
  }

  // Match preferred categories
  if (userProfile.preferredCategories.includes(opportunity.category)) {
    score += 20;
  }

  // Match experience level with difficulty
  if (opportunity.difficulty) {
    if ((userProfile.experienceLevel === 'beginner' && opportunity.difficulty === 'Easy') ||
        (userProfile.experienceLevel === 'intermediate' && opportunity.difficulty === 'Medium') ||
        (userProfile.experienceLevel === 'advanced' && opportunity.difficulty === 'Hard')) {
      score += 15;
    } else if (userProfile.experienceLevel === 'advanced' && opportunity.difficulty === 'Medium') {
      // Advanced users might be ok with medium difficulty
      score += 10;
    } else if (userProfile.experienceLevel === 'intermediate' && opportunity.difficulty === 'Hard') {
      // Intermediate users might attempt hard opportunities
      score += 5;
    }
  }

  // Match career goals
  if (userProfile.careerGoals.length > 0) {
    const opportunityText = `${opportunity.title} ${opportunity.description} ${opportunity.benefits.join(' ')}`;
    const goalMatches = userProfile.careerGoals.filter(goal => 
      opportunityText.toLowerCase().includes(goal.toLowerCase())
    ).length;
    
    if (goalMatches > 0) {
      score += 10 * goalMatches; // Up to 30 points for goal alignment
    }
  }

  // Cap the score to maximum
  return Math.min(score, maxScore);
}

/**
 * Filters and sorts opportunities based on user profile
 */
export function getPersonalizedOpportunities(
  userProfile: UserProfileForRecommendations,
  opportunities: Opportunity[]
): { opportunity: Opportunity, matchScore: number }[] {
  return opportunities
    .map(opportunity => ({
      opportunity,
      matchScore: calculateMatchScore(userProfile, opportunity)
    }))
    .filter(item => item.matchScore > 0) // Only include opportunities with some match
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by highest match score
}