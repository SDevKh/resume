import { analyzeSkillGaps } from '../api/gemini.js';
import { saveAnalysis, isSupabaseConfigured } from '../api/supabase.js';

export function renderSkillGap(container, appState) {
  if (!appState.resumeText) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h1>Skill <span class="gradient-text">Gap Map</span></h1>
          <p>Identify missing skills for your target role.</p>
        </div>
        <div class="empty-state card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
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

  container.innerHTML = `
    <div class="fade-in">
      <div class="page-header">
        <h1>Skill <span class="gradient-text">Gap Map</span></h1>
        <p>Enter your target role to see which skills you need to develop.</p>
      </div>

      <div class="card mb-24">
        <div class="flex gap-12" style="align-items: flex-end;">
          <div class="form-group" style="flex: 1; margin-bottom: 0;">
            <label class="form-label">Target Job Role</label>
            <input type="text" class="form-input" id="target-role-input" 
              placeholder="e.g., Senior Frontend Developer, Data Scientist, DevOps Engineer..."
              value="${appState.targetRole || ''}" />
          </div>
          <button class="btn btn-primary" id="analyze-gap-btn" style="height: 46px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Analyze Gap
          </button>
        </div>
      </div>

      <div id="skillgap-content">
        ${appState.skillGap ? renderSkillGapResults(appState.skillGap) : ''}
      </div>
    </div>
  `;

  // Event listeners
  container.querySelector('#analyze-gap-btn').addEventListener('click', () => {
    const role = container.querySelector('#target-role-input').value.trim();
    if (!role) {
      showToast('Please enter a target job role', 'error');
      return;
    }
    appState.targetRole = role;
    performSkillGapAnalysis(container, appState, role);
  });

  container.querySelector('#target-role-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      container.querySelector('#analyze-gap-btn').click();
    }
  });
}

function renderSkillGapResults(data) {
  return `
    <!-- Match Score -->
    <div class="grid-2 mb-24">
      <div class="card text-center">
        <div class="score-gauge">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#10b981"/>
                <stop offset="100%" style="stop-color:#06b6d4"/>
              </linearGradient>
            </defs>
            <circle class="score-gauge-bg" cx="90" cy="90" r="70"/>
            <circle class="score-gauge-fill" cx="90" cy="90" r="70" 
              style="stroke: url(#gaugeGradient2); stroke-dashoffset: ${440 - (440 * (data.matchPercentage || 0)) / 100}"/>
          </svg>
          <div class="score-gauge-text">
            <div class="score-gauge-value" style="background: var(--gradient-success); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${data.matchPercentage || 0}%</div>
            <div class="score-gauge-label">Role Match</div>
          </div>
        </div>
        <p style="color: var(--text-secondary); margin-top: 12px; font-size: 0.9rem;">${data.targetRoleSummary || ''}</p>
      </div>

      <div class="card">
        <h3 class="card-title">🎯 Your Current Skills</h3>
        ${(data.currentSkills || []).map(skill => `
          <div class="skill-bar-container">
            <div class="skill-bar-header">
              <span class="skill-bar-name">${skill.name} ${skill.relevant ? '✓' : ''}</span>
              <span class="skill-bar-value">${skill.level}%</span>
            </div>
            <div class="skill-bar"><div class="skill-bar-fill ${skill.level >= 75 ? 'high' : skill.level >= 50 ? 'medium' : 'low'}" style="width: ${skill.level}%"></div></div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Missing Skills -->
    <div class="card mb-24">
      <h3 class="card-title">⚠️ Missing Skills</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        ${(data.missingSkills || []).map(skill => `
          <div class="analysis-item" style="border-left-color: ${skill.importance === 'high' ? 'var(--accent-danger)' : skill.importance === 'medium' ? 'var(--accent-warning)' : 'var(--accent-secondary)'};">
            <div class="flex-between mb-8">
              <strong>${skill.name}</strong>
              <span class="question-badge ${skill.importance === 'high' ? 'badge-technical' : skill.importance === 'medium' ? 'badge-situational' : 'badge-general'}">${skill.importance}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">💡 ${skill.suggestion}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recommendations -->
    <div class="card mb-24">
      <h3 class="card-title">📋 Recommendations</h3>
      ${(data.recommendations || []).map((rec, i) => `
        <div class="analysis-item strength" style="margin-bottom: 8px;">
          <strong style="color: var(--accent-success);">${i + 1}.</strong> ${rec}
        </div>
      `).join('')}
    </div>
  `;
}

async function performSkillGapAnalysis(container, appState, targetRole) {
  const contentDiv = container.querySelector('#skillgap-content');
  contentDiv.innerHTML = `
    <div class="card text-center" style="padding: 60px;">
      <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
      <h3>Analyzing skill gaps for "${targetRole}"...</h3>
      <p class="loading-text">Comparing your skills against industry requirements</p>
    </div>
  `;

  try {
    const result = await analyzeSkillGaps(appState.resumeText, targetRole);
    appState.skillGap = result;
    localStorage.setItem('resumeSkillGap', JSON.stringify(result));

    if (isSupabaseConfigured()) {
      try { await saveAnalysis('skillgap', result); }
      catch (err) { console.warn('Supabase save failed:', err); }
    }

    contentDiv.innerHTML = renderSkillGapResults(result);
    showToast('Skill gap analysis complete!', 'success');
  } catch (error) {
    console.error('Skill gap error:', error);
    contentDiv.innerHTML = `
      <div class="card text-center" style="padding: 40px; border-left: 3px solid var(--accent-danger);">
        <h3 style="color: var(--accent-danger); margin-bottom: 8px;">Analysis Failed</h3>
        <p style="color: var(--text-secondary);">${error.message}</p>
        <button class="btn btn-primary mt-16" id="retry-gap">Try Again</button>
      </div>
    `;
    container.querySelector('#retry-gap')?.addEventListener('click', () => performSkillGapAnalysis(container, appState, targetRole));
  }
}

function showToast(message, type = 'info') {
  const c = document.querySelector('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.3s ease'; setTimeout(() => t.remove(), 300); }, 3000);
}
