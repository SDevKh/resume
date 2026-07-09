const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.VITE_GROQ_API_KEY;
const API_URL = import.meta.env.DEV ? '/api-nvidia/v1/chat/completions' : 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'z-ai/glm-5.2';

/**
 * Send a prompt to NVIDIA API and get the response text
 */
async function callAI(prompt) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error('Please set your NVIDIA API key in the .env file (VITE_NVIDIA_API_KEY)');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Check if the API key is configured
 */
export function isAPIConfigured() {
  return API_KEY && API_KEY !== 'your_api_key_here';
}

/**
 * Analyze resume and return a comprehensive report
 */
export async function analyzeResume(resumeText) {
  const prompt = `You are an expert resume analyst. Analyze the following resume and provide a comprehensive evaluation.

Return your response in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "overallScore": 75,
  "sections": {
    "contactInfo": {"score": 90, "feedback": "Clear and complete contact info"},
    "experience": {"score": 70, "feedback": "Good experience but weak action verbs"},
    "education": {"score": 85, "feedback": "Well-structured education section"},
    "skills": {"score": 65, "feedback": "Skills could be more specific"},
    "formatting": {"score": 80, "feedback": "Clean layout but could be more concise"}
  },
  "strengths": [
    "Strong technical skills",
    "Good project descriptions"
  ],
  "improvements": [
    "Use stronger action verbs like 'spearheaded' instead of 'managed'",
    "Add quantifiable achievements"
  ],
  "keySkills": ["JavaScript", "Python", "Project Management"],
  "suggestedJobTitles": ["Software Engineer", "Full Stack Developer"],
  "grammarScore": 92,
  "atsScore": 78,
  "summary": "A brief 2-3 sentence overall summary of the resume quality."
}

RESUME TEXT:
${resumeText}`;

  const response = await callAI(prompt);
  try {
    const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Raw AI response:', response);
    throw new Error('Failed to parse AI analysis. Please try again.');
  }
}

/**
 * Generate personalized interview questions
 */
export async function generateInterviewQuestions(resumeText) {
  const prompt = `You are an expert interview coach. Based on the following resume, generate 12 personalized interview questions that a recruiter or hiring manager would likely ask this candidate.

Categorize each question as: behavioral, technical, or situational.
For each question, provide 2-3 talking points the candidate should cover in their answer, drawing from their actual resume content.

Return your response in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "questions": [
    {
      "id": 1,
      "category": "behavioral",
      "question": "Tell me about a time you led a cross-functional team...",
      "talkingPoints": [
        "Mention your role at [Company] where you...",
        "Highlight the measurable outcome...",
        "Discuss what you learned..."
      ]
    }
  ]
}

Make the questions specific to the candidate's experience, projects, skills, and companies mentioned in their resume.

RESUME TEXT:
${resumeText}`;

  const response = await callAI(prompt);
  try {
    const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Raw AI response:', response);
    throw new Error('Failed to parse interview questions. Please try again.');
  }
}

/**
 * Analyze skill gaps for a target role
 */
export async function analyzeSkillGaps(resumeText, targetRole) {
  const prompt = `You are a career advisor and skill gap analyst. Based on the following resume and the target role "${targetRole}", analyze the skill gaps.

Return your response in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "matchPercentage": 72,
  "currentSkills": [
    {"name": "JavaScript", "level": 90, "relevant": true},
    {"name": "Project Management", "level": 75, "relevant": true}
  ],
  "missingSkills": [
    {"name": "Kubernetes", "importance": "high", "suggestion": "Take the CKA certification course on Udemy"},
    {"name": "GraphQL", "importance": "medium", "suggestion": "Build a small project using Apollo GraphQL"}
  ],
  "recommendations": [
    "Focus on learning cloud-native technologies",
    "Get AWS Solutions Architect certification"
  ],
  "targetRoleSummary": "Brief description of what the target role typically requires"
}

Provide honest, actionable feedback based on real industry requirements for the target role.

RESUME TEXT:
${resumeText}`;

  const response = await callAI(prompt);
  try {
    const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Raw AI response:', response);
    throw new Error('Failed to parse skill gap analysis. Please try again.');
  }
}

/**
 * Predict high-paying career paths based on resume
 */
export async function analyzeCareerPath(resumeText) {
  const prompt = `You are an elite career coach and salary negotiator. Based on the following resume, suggest 3 high-paying career paths this person could pivot to or advance towards.
  
Identify realistic but ambitious roles. For each, provide the estimated modern salary range in Indian Rupees (₹, LPA format if applicable), the core skills they need to learn to bridge the gap, a step-by-step learning path, and the top types of companies/industries to apply to.

Return your response in this EXACT JSON format (no markdown, no code fences, just raw JSON):
{
  "paths": [
    {
      "roleLabel": "AI Solutions Architect",
      "salaryRange": "₹25L - ₹40L+",
      "matchReason": "Leverages your existing python and management skills while adding AI expertise.",
      "skillsToAcquire": [
        "LLM Integration (OpenAI API, LangChain)",
        "Cloud Architecture (AWS/GCP)",
        "System Design"
      ],
      "learningPath": [
        {"step": 1, "action": "Complete deeplearning.ai GenAI course"},
        {"step": 2, "action": "Build 2 full-stack AI portfolio projects"},
        {"step": 3, "action": "Earn AWS Solutions Architect Associate"}
      ],
      "whereToApply": [
        "Enterprise B2B SaaS companies",
        "AI Consulting firms",
        "Fintech startups"
      ]
    }
  ]
}

Make the recommendations highly tailored, actionable, and focused on maximizing their earning potential based on their current floor.

RESUME TEXT:
${resumeText}`;

  const response = await callAI(prompt);
  try {
    const jsonStr = response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Raw AI response:', response);
    throw new Error('Failed to parse career path analysis. Please try again.');
  }
}

/**
 * Rewrite and enhance the entire resume text
 * @returns {Promise<string>} Clean markdown text
 */
export async function enhanceResumeText(resumeText) {
  const prompt = `You are an elite executive resume writer. Your task is to completely rewrite, polish, and optimize the following resume text to pass ATS systems and instantly impress hiring managers.

Instructions:
1. Fix all grammar, spelling, and tense issues.
2. Upgrade all bullet points to use strong, high-impact Action Verbs (e.g., spearheaded, architected, orchestrated).
3. Ensure responsibilities sound like measurable achievements where possible.
4. Structure the output meticulously using clean Markdown syntax (Headers, bolding, bullet points).
5. Output ONLY the raw Markdown text. Do NOT wrap it in a JSON object. Do NOT add conversational intro/outro text. Just start straight with the markdown content.

RESUME TEXT TO ENHANCE:
${resumeText}`;

  const response = await callAI(prompt);
  return response.trim();
}
