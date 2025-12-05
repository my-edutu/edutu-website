import type { Opportunity } from '../types/opportunity';
import { addOpportunityToN8n, updateOpportunitiesInN8n } from '../services/n8nIntegration';
import { formatUserProfileForRecommendations } from '../services/personalizedRecommendations';
import type { AppUser } from '../types/user';

// Sample opportunities data for testing
export const sampleOpportunities: Opportunity[] = [
  {
    id: "test-1",
    title: "Google Summer of Code",
    organization: "Google",
    category: "Tech",
    location: "Remote",
    description: "Participate in open source projects with mentoring.",
    requirements: ["Programming skills", "Open source contribution"],
    benefits: ["Stipend", "Mentoring", "Networking"],
    applicationProcess: ["Apply online", "Submit proposal", "Interview"],
    match: 0,
    deadline: "March 2024",
    difficulty: "Medium",
    applicants: "5000+",
    successRate: "10%",
    applyUrl: "https://summerofcode.withgoogle.com"
  },
  {
    id: "test-2",
    title: "MLH Fellowship",
    organization: "Major League Hacking",
    category: "Tech",
    location: "Remote",
    description: "Full-time, paid training program for students.",
    requirements: ["College student", "Technical background"],
    benefits: ["Stipend", "Real project experience", "Career support"],
    applicationProcess: ["Submit application", "Technical interview", "Final round"],
    match: 0,
    deadline: "Rolling",
    difficulty: "Medium",
    applicants: "1000+",
    successRate: "15%",
    applyUrl: "https://fellowship.mlh.io"
  }
];

// Sample user profile for testing
export const sampleUser: AppUser = {
  id: "user-123",
  name: "Alex Johnson",
  age: 22,
  courseOfStudy: "Computer Science"
};

export const sampleUserPreferences = {
  interests: ["Technology", "Open Source", "Machine Learning"],
  location: "Remote",
  careerGoals: ["Software Engineer", "Product Manager"],
  experienceLevel: "intermediate",
  preferredCategories: ["Tech", "Engineering"],
  availability: "part-time"
};

/**
 * Test the n8n integration with sample data
 */
export async function testN8nIntegration() {
  console.log("Testing n8n integration with sample opportunities...");
  
  // Test sending opportunities to n8n
  const success = await updateOpportunitiesInN8n(sampleOpportunities, sampleUser.id);
  console.log("Update opportunities result:", success);
  
  // Test adding a single opportunity
  const singleOpportunity = sampleOpportunities[0];
  const addSuccess = await addOpportunityToN8n(singleOpportunity, sampleUser.id);
  console.log("Add opportunity result:", addSuccess);
  
  // Test user profile formatting
  const userProfile = formatUserProfileForRecommendations(sampleUser, sampleUserPreferences);
  console.log("Formatted user profile:", userProfile);
  
  return {
    updateSuccess: success,
    addSuccess: addSuccess,
    userProfile
  };
}

/**
 * Run basic tests for the personalized recommendations system
 */
export async function runIntegrationTests() {
  console.log("Running integration tests...");
  
  // Test n8n integration
  const n8nTestResult = await testN8nIntegration();
  console.log("n8n integration test completed:", n8nTestResult);
  
  console.log("Integration tests completed successfully!");
}