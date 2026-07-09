# CareerPilot 🚀

CareerPilot is an AI-powered next-generation resume analyzer and career insights platform. It reads your PDF resume, parses its content, and leverages the Groq API (LLaMA 3.3 70B) to provide comprehensive feedback, bridge skill gaps, generate tailored interview questions, and identify high-paying career pivots. All user data and analyses are securely persisted using Supabase.

---

## 🌟 Key Features

### 1. 📄 Intelligent Resume Parsing
*   **How it Works:** Users upload their resume in PDF format. The frontend uses Mozilla's `pdf.js` library (`pdfParser.js`) to extract the raw text, word count, and page count entirely on the client-side. This ensures fast, secure processing before the text is even sent for analysis.

### 2. 📊 AI Resume Analysis
*   **How it Works:** The extracted resume text is sent to the Groq API via a rigorously structured prompt (`gemini.js`). The AI acts as an expert resume reviewer and returns a JSON payload containing an overall "AI Score", an "ATS Parse Score", actionable feedback on formatting, and recommendations for stronger action verbs.

### 3. 🎯 Skill Gap Mapping
*   **How it Works:** Users input a target job role (e.g., "Senior React Developer"). CareerPilot compares the user's current resume against industry standards for that specific role. It returns a match percentage, validates current relevant skills, and outlines missing high-value skills with exact, actionable steps to acquire them (e.g., "Build a full-stack Next.js app").

### 4. 🎤 Personalized Interview Prep
*   **How it Works:** Analyzing the specific projects, skills, and past companies listed in the resume, the AI generates 12 personalized interview questions. They are categorized into Behavioral, Technical, and Situational questions. Furthermore, each question includes 2-3 "Talking Points" derived *directly* from the user's own resume, coaching them on how to construct the perfect STAR method answer.

### 5. 💰 Career Insights & Salary Predictions
*   **How it Works:** The AI acts as an elite career coach. It reviews the resume and suggests 3 realistic, high-paying career paths the user can pivot into. It provides estimated salary ranges in Indian Rupees (₹ LPA format) and defines the crucial missing skills and exact step-by-step learning paths required to get that specific job.

### 6. 🔐 Authentication & Data Persistence
*   **How it Works:** CareerPilot integrates directly with **Supabase**. 
    *   **Auth Page:** Users can create an account using Email/Password. A secure guest mode fallback using `localStorage` is also available.
    *   **Database Sync:** When a logged-in user uploads a resume or generates an AI analysis, the JSON payload is automatically saved to the Supabase PostgreSQL database. When the user logs back in on any device, `main.js` instantly queries Supabase and restores their complete session state.

---

## 🏗️ Architecture & Tech Stack

*   **Frontend HTML/CSS/JS:** Vanilla web technologies utilizing native ES6 Modules for component separation.
*   **Vite:** Extremely fast local development server and bundler.
*   **PDF.js (`pdfjs-dist`):** Used to reliably read and extract raw strings from uploaded `.pdf` binaries.
*   **Groq API (`llama-3.3-70b-versatile`):** The lightning-fast AI engine powering all text analysis, operating through standard REST fetch calls.
*   **Supabase (`@supabase/supabase-js`):** Open-source Firebase alternative providing the Postgres database, Row Level Security (RLS) tables, and User Authentication.

---

## 📂 File Structure Explanation

*   **`index.html`**: The main entry point. Contains the app shell where different pages are dynamically injected.
*   **`src/main.js`**: The central controller. Handles application global state (`appState`), manages routing logic between pages, checks user auth status, and restores persistent UI state on reload.
*   **`src/style.css`**: Global design system. Contains all CSS variables including our signature Neon Yellow (`#E4FF30`) and Deep Purple aesthetic, component stylings (buttons, cards), and layout grids.
*   **`src/landing.css`**: Specific, isolated stylings for the initial non-logged-in marketing page.
*   **`src/api/gemini.js`**: The AI Service Layer. Contains all the prompt-engineering logic and fetch calls specifically tailored to parse JSON payloads from the Groq API.
*   **`src/api/supabase.js`**: The Database Service Layer. Contains the Supabase client initialization, authentication wrappers, and CRUD functions to save/load resumes and analyses.
*   **`src/utils/pdfParser.js`**: Helper functions leveraging the `pdfjs-dist` worker to extract raw string text from user-uploaded PDFs.
*   **`src/pages/`**: Contains the isolated UI rendering logic and specific event listeners for each unique screen in the application:
    *   `auth.js`: The sign-up/login screen.
    *   `landing.js`: The marketing home page.
    *   `dashboard.js`: The master file upload zone and action hub.
    *   `analyzer.js`: Renders the AI score feedback.
    *   `skillGap.js`: Renders target role comparisons.
    *   `interview.js`: Renders the categorized preparation questions.
    *   `careerPath.js`: Renders the high-paying salary suggestions.
