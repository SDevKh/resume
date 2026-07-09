import { analyzeResume, enhanceResumeText } from '../api/gemini.js';
import { saveAnalysis, isSupabaseConfigured } from '../api/supabase.js';

export function renderAnalyzer(container, appState) {
  if (!appState.resumeText) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h1>Resume <span class="gradient-text">Analyzer</span></h1>
          <p>Get AI-powered insights and improvements for your resume.</p>
        </div>
        <div class="empty-state card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <h3>No Resume Uploaded</h3>
          <p>Go to the Dashboard and upload your resume PDF first.</p>
          <button class="btn btn-primary" id="go-dashboard">Go to Dashboard</button>
        </div>
      </div>
    `;
    container.querySelector('#go-dashboard')?.addEventListener('click', () => {
      document.querySelector('[data-page="dashboard"]').click();
    });
    return;
  }

  const analysis = appState.analysis;

  container.innerHTML = `
    <div class="fade-in">
      <div class="page-header flex-between">
        <div>
          <h1>Resume <span class="gradient-text">Analyzer</span></h1>
          <p>AI-powered analysis and improvement suggestions</p>
        </div>
        <div style="display: flex; gap: 12px;">
          ${analysis ? `
            <button class="btn btn-secondary" id="download-enhanced-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Enhanced Resume
            </button>
          ` : ''}
          <button class="btn btn-primary" id="analyze-btn">
            ${analysis ? '🔄 Re-analyze' : '🔍 Analyze Now'}
          </button>
        </div>
      </div>

      <div id="analysis-content">
        ${analysis ? renderAnalysisResults(analysis) : renderAnalysisPlaceholder()}
      </div>
    </div>
  `;

  // Event listeners
  container.querySelector('#analyze-btn').addEventListener('click', async () => {
    await performAnalysis(container, appState);
  });

  const downloadBtn = container.querySelector('#download-enhanced-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      await handleDownloadEnhancedResume(downloadBtn, appState.resumeText);
    });
  }
}

async function handleDownloadEnhancedResume(btn, resumeText) {
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div> Rewriting...';
  btn.disabled = true;

  try {
    const markdownContent = await enhanceResumeText(resumeText);

    // Create a Blob from the markdown string
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Enhanced_Resume.md';
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    showToast('Enhanced resume downloaded successfully!', 'success');
  } catch (error) {
    console.error('Enhancement failed:', error);
    showToast('Failed to generate enhanced resume. Please try again.', 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

function renderAnalysisPlaceholder() {
  return `
    <div class="card text-center" style="padding: 60px;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.5" style="margin: 0 auto 16px; display: block;">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <h3 style="margin-bottom: 8px;">Ready to Analyze</h3>
      <p style="color: var(--text-secondary); margin-bottom: 24px;">Click "Analyze Now" to get AI-powered insights on your resume.</p>
    </div>
  `;
}

function renderAnalysisResults(analysis) {
  const sections = analysis.sections || {};
  const sectionEntries = Object.entries(sections);

  return `
    <!-- Score Overview -->
    <div class="grid-2 mb-24">
      <div class="card text-center">
        <div class="score-gauge">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#6366f1"/>
                <stop offset="100%" style="stop-color:#06b6d4"/>
              </linearGradient>
            </defs>
            <circle class="score-gauge-bg" cx="90" cy="90" r="70"/>
            <circle class="score-gauge-fill" cx="90" cy="90" r="70" 
              style="stroke-dashoffset: ${440 - (440 * (analysis.overallScore || 0)) / 100}"/>
          </svg>
          <div class="score-gauge-text">
            <div class="score-gauge-value">${analysis.overallScore || 0}%</div>
            <div class="score-gauge-label">Overall Score</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">📊 Quick Metrics</h3>
        <div class="skill-bar-container">
          <div class="skill-bar-header">
            <span class="skill-bar-name">Grammar Score</span>
            <span class="skill-bar-value">${analysis.grammarScore || 0}%</span>
          </div>
          <div class="skill-bar"><div class="skill-bar-fill ${getLevel(analysis.grammarScore)}" style="width: ${analysis.grammarScore || 0}%"></div></div>
        </div>
        <div class="skill-bar-container">
          <div class="skill-bar-header">
            <span class="skill-bar-name">ATS Compatibility</span>
            <span class="skill-bar-value">${analysis.atsScore || 0}%</span>
          </div>
          <div class="skill-bar"><div class="skill-bar-fill ${getLevel(analysis.atsScore)}" style="width: ${analysis.atsScore || 0}%"></div></div>
        </div>
        ${sectionEntries.map(([key, val]) => `
          <div class="skill-bar-container">
            <div class="skill-bar-header">
              <span class="skill-bar-name">${formatSectionName(key)}</span>
              <span class="skill-bar-value">${val.score || 0}%</span>
            </div>
            <div class="skill-bar"><div class="skill-bar-fill ${getLevel(val.score)}" style="width: ${val.score || 0}%"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Summary -->
    <div class="card mb-24">
      <h3 class="card-title">📝 Summary</h3>
      <p style="color: var(--text-secondary); line-height: 1.8;">${analysis.summary || ''}</p>
    </div>

    <!-- Strengths & Improvements -->
    <div class="grid-2 mb-24">
      <div class="card">
        <h3 class="card-title" style="color: var(--accent-success);">✅ Strengths</h3>
        ${(analysis.strengths || []).map(s => `
          <div class="analysis-item strength">${s}</div>
        `).join('')}
      </div>
      <div class="card">
        <h3 class="card-title" style="color: var(--accent-warning);">⚡ Improvements</h3>
        ${(analysis.improvements || []).map(s => `
          <div class="analysis-item improvement">${s}</div>
        `).join('')}
      </div>
    </div>

    <!-- Detected Skills & Suggested Titles -->
    <div class="grid-2 mb-24">
      <div class="card">
        <h3 class="card-title">🎯 Key Skills Detected</h3>
        <div class="flex gap-8" style="flex-wrap: wrap;">
          ${(analysis.keySkills || []).map(skill => `
            <span style="background: rgba(99, 102, 241, 0.15); color: var(--accent-primary-light); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;">${skill}</span>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h3 class="card-title">💼 Suggested Job Titles</h3>
        <div class="flex gap-8" style="flex-wrap: wrap;">
          ${(analysis.suggestedJobTitles || []).map(title => `
            <span style="background: rgba(6, 182, 212, 0.15); color: var(--accent-secondary); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 500;">${title}</span>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Section Feedback -->
    <div class="card mb-24">
      <h3 class="card-title">📋 Section-by-Section Feedback</h3>
      ${sectionEntries.map(([key, val]) => `
        <div class="analysis-item" style="margin-bottom: 12px;">
          <strong style="color: var(--text-primary);">${formatSectionName(key)}</strong>
          <span style="float: right; color: ${val.score >= 80 ? 'var(--accent-success)' : val.score >= 60 ? 'var(--accent-warning)' : 'var(--accent-danger)'};">${val.score}%</span>
          <p style="margin-top: 6px; color: var(--text-secondary); font-size: 0.85rem;">${val.feedback || ''}</p>
        </div>
      `).join('')}
    </div>
  `;
}

async function performAnalysis(container, appState) {
  const contentDiv = container.querySelector('#analysis-content');
  contentDiv.innerHTML = `
    <div class="card text-center" style="padding: 60px; position: relative;">
      <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
      <h3>Analyzing your resume...</h3>
      <p class="loading-text">This may take 10-15 seconds</p>
    </div>
  `;

  try {
    const analysis = await analyzeResume(appState.resumeText);
    appState.analysis = analysis;
    localStorage.setItem('resumeAnalysis', JSON.stringify(analysis));

    if (isSupabaseConfigured()) {
      try { await saveAnalysis('analysis', analysis); }
      catch (err) { console.warn('Supabase save failed:', err); }
    }

    contentDiv.innerHTML = renderAnalysisResults(analysis);
    showToast('Analysis complete!', 'success');
  } catch (error) {
    console.error('Analysis error:', error);
    contentDiv.innerHTML = `
      <div class="card text-center" style="padding: 40px; border-left: 3px solid var(--accent-danger);">
        <h3 style="color: var(--accent-danger); margin-bottom: 8px;">Analysis Failed</h3>
        <p style="color: var(--text-secondary);">${error.message}</p>
        <button class="btn btn-primary mt-16" id="retry-analyze">Try Again</button>
      </div>
    `;
    container.querySelector('#retry-analyze')?.addEventListener('click', () => performAnalysis(container, appState));
  }
}

function getLevel(score) {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function formatSectionName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function showToast(message, type = 'info') {
  const container = document.querySelector('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
