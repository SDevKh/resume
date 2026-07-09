import './style.css';
import './landing.css';
import { renderLanding } from './pages/landing.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderAnalyzer } from './pages/analyzer.js';
import { renderSkillGap } from './pages/skillGap.js';
import { renderInterview } from './pages/interview.js';
import { renderCareerPath } from './pages/careerPath.js';
import { isAPIConfigured } from './api/gemini.js';
import { renderAuth } from './pages/auth.js';
import { getCurrentUser, signOut, loadResume, loadAnalysis, isSupabaseConfigured } from './api/supabase.js';

// Global application state
const appState = {
  user: null,
  resumeText: null,
  fileName: null,
  pageCount: 0,
  wordCount: 0,
  analysis: null,
  skillGap: null,
  interviewQuestions: null,
  careerPath: null,
  targetRole: '',
  currentPage: 'dashboard'
};

// Restore state from Supabase or localStorage
async function restoreState(user) {
  if (user && isSupabaseConfigured()) {
    try {
      const resume = await loadResume();
      if (resume) {
        appState.resumeText = resume.resume_text;
        appState.fileName = resume.file_name;
        appState.pageCount = resume.page_count;
        appState.wordCount = resume.word_count;
      }
      appState.analysis = await loadAnalysis('analysis');
      appState.skillGap = await loadAnalysis('skillgap');
      appState.interviewQuestions = await loadAnalysis('interview');
      appState.careerPath = await loadAnalysis('careerpath');
    } catch (e) {
      console.warn('Failed to restore from Supabase:', e);
    }
  } else {
    try {
      const saved = localStorage.getItem('resumeState');
      if (saved) {
        const parsed = JSON.parse(saved);
        appState.resumeText = parsed.resumeText;
        appState.fileName = parsed.fileName;
        appState.pageCount = parsed.pageCount;
        appState.wordCount = parsed.wordCount;
      }
      const analysis = localStorage.getItem('resumeAnalysis');
      if (analysis) appState.analysis = JSON.parse(analysis);
      const skillGap = localStorage.getItem('resumeSkillGap');
      if (skillGap) appState.skillGap = JSON.parse(skillGap);
      const interviewQ = localStorage.getItem('resumeInterviewQuestions');
      if (interviewQ) appState.interviewQuestions = JSON.parse(interviewQ);
      const careerPath = localStorage.getItem('resumeCareerPath');
      if (careerPath) appState.careerPath = JSON.parse(careerPath);
    } catch (e) {
      console.warn('Failed to restore saved state:', e);
    }
  }
}

// Page renderers map
const pages = {
  dashboard: renderDashboard,
  analyzer: renderAnalyzer,
  skillgap: renderSkillGap,
  interview: renderInterview,
  careerpath: renderCareerPath
};

// Navigate to a page
function navigateTo(pageName) {
  appState.currentPage = pageName;
  const mainContent = document.querySelector('#main-content');

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // Render the page
  const renderer = pages[pageName];
  if (renderer) {
    mainContent.innerHTML = '';
    renderer(mainContent, appState);
  }
}

// Enter the main app (from landing page)
function enterApp() {
  const app = document.getElementById('app');

  // Rebuild the main app shell
  app.innerHTML = `
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span class="logo-text">CareerPilot</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item active" data-page="dashboard" id="nav-dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </a>
        <a href="#" class="nav-item" data-page="analyzer" id="nav-analyzer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>Resume Analyzer</span>
        </a>
        <a href="#" class="nav-item" data-page="skillgap" id="nav-skillgap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Skill Gap Map</span>
        </a>
        <a href="#" class="nav-item" data-page="interview" id="nav-interview">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Interview Prep</span>
        </a>
        <a href="#" class="nav-item" data-page="careerpath" id="nav-careerpath">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          <span>Career Insights</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="api-status" id="api-status" style="margin-bottom: 12px;">
          <div class="status-dot"></div>
          <span>API Not Connected</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="logout-btn" style="width: 100%; display: none; padding: 6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; display: inline-block; vertical-align: text-bottom;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" id="main-content">
    </main>
  `;

  // Update API status indicator
  const apiStatus = document.querySelector('#api-status');
  if (isAPIConfigured()) {
    apiStatus.classList.add('connected');
    apiStatus.querySelector('span').textContent = 'NVIDIA API Connected';
  }

  // Setup nav click handlers
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Setup logout button
  const logoutBtn = document.getElementById('logout-btn');
  getCurrentUser().then(user => {
    if (user) {
      logoutBtn.style.display = 'block';
      logoutBtn.addEventListener('click', async () => {
        await signOut();
        sessionStorage.removeItem('guestMode');
        location.reload();
      });
    }
  });

  // Render initial page
  navigateTo('dashboard');
}

// Initialize the app
async function init() {
  const user = await getCurrentUser();
  appState.user = user;
  await restoreState(user);

  const isConfigured = isSupabaseConfigured();
  const guestMode = sessionStorage.getItem('guestMode') === 'true';

  if (sessionStorage.getItem('appEntered') === 'true') {
    if (user || !isConfigured || guestMode) {
      enterApp();
    } else {
      renderAuth(document.getElementById('app'), async (success) => {
        if (success === null) sessionStorage.setItem('guestMode', 'true');
        location.reload();
      });
    }
  } else {
    renderLanding(() => {
      sessionStorage.setItem('appEntered', 'true');
      if (user || !isConfigured || guestMode) {
        enterApp();
      } else {
        renderAuth(document.getElementById('app'), async (success) => {
          if (success === null) sessionStorage.setItem('guestMode', 'true');
          location.reload();
        });
      }
    });
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
