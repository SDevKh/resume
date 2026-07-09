import { isAPIConfigured, analyzeResume } from '../api/gemini.js';
import { parseResumeFile } from '../utils/fileParser.js';
import { saveResume, saveAnalysis, isSupabaseConfigured } from '../api/supabase.js';

export function renderDashboard(container, appState) {
  const hasResume = appState.resumeText && appState.resumeText.length > 0;

  let welcomeText = 'to <span class="gradient-text">CareerPilot</span>';
  if (appState.user && appState.user.email) {
    const username = appState.user.email.split('@')[0];
    // Capitalize first letter
    const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
    welcomeText = `<span class="gradient-text">${capitalizedUsername}</span>`;
  }

  container.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>Welcome ${welcomeText}</h1>
        <p>Upload your resume to get AI-powered analysis, skill gap insights, and personalized interview questions.</p>
      </div>

      ${!isAPIConfigured() ? `
        <div class="card mb-24" style="border-left: 3px solid var(--accent-warning);">
          <div class="flex gap-12" style="align-items: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warning)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
              <h4 style="color: var(--accent-warning); margin-bottom: 4px;">API Key Required</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">
                Add your free Groq API key to <code style="background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">.env</code> file: 
                <code style="background: var(--bg-input); padding: 2px 6px; border-radius: 4px;">VITE_GROQ_API_KEY=your_key</code>
                <br>Get a free key at <a href="https://console.groq.com/keys" target="_blank" style="color: var(--accent-primary-light);">console.groq.com/keys</a>
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Upload Zone -->
      <div class="card mb-32" id="upload-card">
        <div class="upload-zone" id="upload-zone">
          <div class="upload-zone-content">
            <div class="upload-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3>Drop your resume <span style="color: var(--accent-primary);">PDF, DOCX, TXT, or Image</span> here</h3>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">Max file size: 10MB</p>
          </div>
          <input type="file" id="file-input" accept=".pdf, .docx, .doc, .txt, .jpg, .jpeg, .png" style="display: none;" />
        </div>

        ${hasResume ? `
          <div class="file-info" id="file-info">
            <div class="file-info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="file-info-details" style="flex: 1;">
              <h4>${appState.fileName || 'Resume'}</h4>
              <p>${appState.wordCount || 0} words • ${appState.pageCount || 1} page(s)</p>
            </div>
            <button class="btn btn-sm btn-success" id="re-upload-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              Re-upload
            </button>
          </div>
        ` : ''}
      </div>

      ${hasResume ? `
        <!-- Stats -->
        <div class="stats-grid fade-in stagger-1" id="stats-grid">
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div class="stat-info">
              <h4>Word Count</h4>
              <div class="stat-value">${appState.wordCount || 0}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <div class="stat-info">
              <h4>Pages</h4>
              <div class="stat-value">${appState.pageCount || 0}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div class="stat-info">
              <h4>AI Score</h4>
              <div class="stat-value">${appState.analysis?.overallScore || '—'}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div class="stat-info">
              <h4>ATS Score</h4>
              <div class="stat-value">${appState.analysis?.atsScore || '—'}</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card fade-in stagger-2">
          <h3 class="card-title">🚀 Quick Actions</h3>
          <div class="flex gap-12" style="flex-wrap: wrap;">
            <button class="btn btn-primary" data-action="analyze" id="action-analyze">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Analyze Resume
            </button>
            <button class="btn btn-success" data-action="interview" id="action-interview">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Generate Interview Q's
            </button>
            <button class="btn btn-secondary" data-action="skillgap" id="action-skillgap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Skill Gap Analysis
            </button>
            <button class="btn btn-primary" style="background: var(--bg-card); border: 1px solid var(--accent-primary); color: var(--text-primary);" data-action="careerpath" id="action-careerpath">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              Career Insights
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Event listeners
  setupUploadListeners(container, appState);
  setupQuickActions(container, appState);
}

function setupUploadListeners(container, appState) {
  const uploadZone = container.querySelector('#upload-zone');
  const fileInput = container.querySelector('#file-input');
  const browseTrigger = container.querySelector('#browse-trigger');
  const reUploadBtn = container.querySelector('#re-upload-btn');

  if (browseTrigger) {
    browseTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];

      if (!file) return;

      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'jpg', 'jpeg', 'png'];
      const extension = file.name.split('.').pop().toLowerCase();

      if (validTypes.includes(file.type) || validExtensions.includes(extension)) {
        handleFileUpload(file, appState);
      } else {
        showToast('Please upload a PDF, DOCX, TXT, or Image file', 'error');
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file, appState);
    });
  }

  if (reUploadBtn) {
    reUploadBtn.addEventListener('click', () => fileInput.click());
  }
}

async function handleFileUpload(file, appState) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('File too large. Maximum size is 10MB.', 'error');
    return;
  }

  const uploadZone = document.querySelector('#upload-zone');
  uploadZone.innerHTML = `
    <div class="upload-zone-content">
      <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
      <h3>Extracting text...</h3>
      <p style="color: var(--text-secondary);">This may take a moment for images</p>
    </div>
  `;

  try {
    const result = await parseResumeFile(file);
    appState.resumeText = result.text;
    appState.pageCount = result.pageCount;
    appState.wordCount = result.wordCount;
    appState.fileName = file.name;

    // Save core resume details to localStorage
    localStorage.setItem('resumeState', JSON.stringify({
      resumeText: appState.resumeText,
      pageCount: appState.pageCount,
      wordCount: appState.wordCount,
      fileName: appState.fileName,
    }));

    // Clear old analysis strings when a new file is uploaded
    appState.analysis = null;
    appState.skillGap = null;
    appState.interviewQuestions = null;
    appState.careerPath = null;
    localStorage.removeItem('resumeAnalysis');
    localStorage.removeItem('resumeSkillGap');
    localStorage.removeItem('resumeInterviewQuestions');
    localStorage.removeItem('resumeCareerPath');

    // Save to Supabase (if configured and logged in)
    if (isSupabaseConfigured()) {
      try {
        await saveResume({
          fileName: appState.fileName,
          resumeText: appState.resumeText,
          wordCount: appState.wordCount,
          pageCount: appState.pageCount
        });
      } catch (err) {
        console.warn('Supabase save failed:', err);
      }
    }

    showToast('Resume uploaded! Analyzing with AI...', 'success');

    // Re-render dashboard first to show file info
    const mainContent = document.querySelector('#main-content');
    renderDashboard(mainContent, appState);

    // Auto-run AI analysis if API is configured
    if (isAPIConfigured() && !appState.analysis) {
      try {
        const analysis = await analyzeResume(appState.resumeText);
        appState.analysis = analysis;
        localStorage.setItem('resumeAnalysis', JSON.stringify(analysis));

        if (isSupabaseConfigured()) {
          try { await saveAnalysis('analysis', analysis); }
          catch (e) { console.warn('Supabase analysis save failed:', e); }
        }

        showToast('AI analysis complete!', 'success');
        // Re-render to show scores
        renderDashboard(mainContent, appState);
      } catch (err) {
        console.warn('Auto-analysis failed:', err);
        showToast('Auto-analysis failed. Use "Analyze Resume" button to retry.', 'error');
      }
    }
  } catch (error) {
    console.error('File parsing error:', error);
    showToast('Failed to parse file. Please try another file.', 'error');
    const mainContent = document.querySelector('#main-content');
    renderDashboard(mainContent, appState);
  }
}

function setupQuickActions(container, appState) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      // Navigate to the corresponding page
      const navItem = document.querySelector(`[data-page="${action === 'analyze' ? 'analyzer' : action}"]`);
      if (navItem) navItem.click();
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.querySelector('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
