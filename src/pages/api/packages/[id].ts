// API route to get package details by ID
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const packageId = params.id;
  
  // In a real implementation, this would fetch from a database
  // For now, we'll return sample data
  if (!packageId) {
    return new Response(
      JSON.stringify({ error: 'Package ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Sample data for the Mastercard Foundation package
  if (packageId === 'mc-001') {
    const packageData = {
      id: "mc-001",
      title: "Mastercard Foundation Scholarship — Full Step-by-Step Guide",
      shortDescription: "Exact process used to win the Mastercard Foundation Scholarship: essays, timeline, templates.",
      fullDescription: "This comprehensive guide walks you through every step of the Mastercard Foundation Scholarship application process. From preparing your personal statement to securing recommendation letters, this roadmap provides the exact strategy used by successful scholars.",
      coverImageUrl: "/images/mastercard-cover.jpg",
      difficulty: "Intermediate",
      estimatedCompletionTime: "2–3 hours",
      price: 0,
      tags: ["Scholarship", "Mastercard", "Interview prep", "Application"],
      creator: {
        id: "creator-aliyah",
        name: "Aliyah Musa",
        shortBio: "Mastercard Scholar — University of Edinburgh, GPA 4.52/5.0",
        avatarUrl: "/images/aliyah.jpg",
        credibilityBadge: "Verified Scholar"
      },
      includedItems: [
        "Personal Statement Template",
        "CV Template",
        "Recommendation Letter Template", 
        "Interview Prep Materials",
        "Timeline Tracker"
      ],
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      roadmap: [
        {
          stepId: "step-1",
          title: "Research & Preparation",
          description: "Understand the scholarship requirements and prepare your materials",
          tasks: [
            { taskId: "task-1", text: "Read scholarship guidelines carefully", done: false },
            { taskId: "task-2", text: "Gather required documents", done: false },
            { taskId: "task-3", text: "Create application timeline", done: false }
          ],
          estimatedTime: "30 mins",
          attachments: [],
          progressState: "todo"
        },
        {
          stepId: "step-2", 
          title: "Personal Statement",
          description: "Craft a compelling personal statement that stands out",
          tasks: [
            { taskId: "task-4", text: "Outline your background & journey", done: false },
            { taskId: "task-5", text: "Draft personal statement", done: false },
            { taskId: "task-6", text: "Review and edit with feedback", done: false }
          ],
          estimatedTime: "1 hour",
          attachments: [],
          progressState: "todo"
        },
        {
          stepId: "step-3",
          title: "CV & Supporting Documents",
          description: "Prepare a scholarship-worthy CV and supporting documents",
          tasks: [
            { taskId: "task-7", text: "Update CV with key achievements", done: false },
            { taskId: "task-8", text: "Prepare academic transcripts", done: false },
            { taskId: "task-9", text: "Gather certificates and awards", done: false }
          ],
          estimatedTime: "45 mins",
          attachments: [],
          progressState: "todo"
        },
        {
          stepId: "step-4",
          title: "Submit & Follow Up", 
          description: "Finalize and submit your application",
          tasks: [
            { taskId: "task-10", text: "Final review of all materials", done: false },
            { taskId: "task-11", text: "Submit application", done: false },
            { taskId: "task-12", text: "Follow up as needed", done: false }
          ],
          estimatedTime: "30 mins",
          attachments: [],
          progressState: "todo"
        }
      ],
      templates: [
        { id: "tmpl-1", title: "Personal Statement Template", fileUrl: "/templates/essay.pdf", fileType: "PDF" },
        { id: "tmpl-2", title: "CV Template", fileUrl: "/templates/cv.docx", fileType: "DOCX" },
        { id: "tmpl-3", title: "Recommendation Letter Template", fileUrl: "/templates/rec-letter.docx", fileType: "DOCX" }
      ],
      resources: [
        { id: "res-1", title: "Mastercard Foundation Official Site", url: "https://mastercardfdn.org", type: "link", notes: "Official scholarship information" },
        { id: "res-2", title: "Interview Preparation Video", url: "https://youtube.com/interview-tips", type: "video", notes: "Tips for scholarship interviews" },
        { id: "res-3", title: "Application Timeline", url: "/resources/timeline.pdf", type: "document", notes: "Step-by-step timeline" }
      ],
      personalStory: {
        text: "When I first heard about the Mastercard Foundation Scholarship, I was intimidated. The application process seemed complex and competitive. However, with a structured approach and the right resources, I was able to successfully navigate the process. This guide contains all the strategies and templates that I used to win my scholarship, including specific examples of what made my application stand out.",
        proofs: [
          "/images/scholarship-proof-1.jpg",
          "/images/scholarship-proof-2.jpg"
        ]
      },
      tips: {
        dos: [
          "Start early with the application process",
          "Customize each essay for the specific program",
          "Secure recommendation letters well in advance",
          "Proofread all documents multiple times"
        ],
        donts: [
          "Wait until the last minute to apply",
          "Use generic essays across different applications",
          "Ask for recommendations without giving context",
          "Submit documents without reviewing them"
        ]
      },
      reviews: [
        { 
          id: "rev-1", 
          userId: "user-123", 
          rating: 5, 
          comment: "This guide was incredibly helpful! The step-by-step approach made the whole process much less overwhelming.", 
          createdAt: "2023-10-15" 
        },
        { 
          id: "rev-2", 
          userId: "user-456", 
          rating: 4, 
          comment: "Great templates and resources. Some steps could be more detailed but overall very useful.", 
          createdAt: "2023-09-22" 
        }
      ],
      progress: {
        packageId: "mc-001",
        completedTasks: [],
        percentComplete: 0
      }
    };

    return new Response(
      JSON.stringify(packageData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // If not found, return 404
  return new Response(
    JSON.stringify({ error: 'Package not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
};