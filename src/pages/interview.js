import { generateInterviewQuestions } from '../api/gemini.js';
import { saveAnalysis, isSupabaseConfigured } from '../api/supabase.js';

export function renderInterview(container, appState) {
  if (!appState.resumeText) {
    container.innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h1>Interview <span class="gradient-text">Prep</span></h1>
          <p>Practice with AI-generated interview questions tailored to your resume.</p>
        </div>
        <div class="empty-state card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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

  const questions = appState.interviewQuestions;

  container.innerHTML = `
    <div class="fade-in">
      <div class="page-header flex-between">
        <div>
          <h1>Interview <span class="gradient-text">Prep</span></h1>
          <p>Personalized interview questions generated from your resume content</p>
        </div>
        <div class="flex gap-12">
          ${questions ? `
            <button class="btn btn-secondary" id="copy-all-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy All
            </button>
          ` : ''}
          <button class="btn btn-primary" id="generate-btn">
            ${questions ? '🔄 Generate New' : '🎯 Generate Questions'}
          </button>
        </div>
      </div>

      ${questions ? `
        <!-- Filter Tabs -->
        <div class="tabs" id="question-tabs">
          <button class="tab active" data-filter="all">All (${questions.questions?.length || 0})</button>
          <button class="tab" data-filter="behavioral">Behavioral</button>
          <button class="tab" data-filter="technical">Technical</button>
          <button class="tab" data-filter="situational">Situational</button>
        </div>
      ` : ''}

      <div id="questions-content">
        ${questions ? renderQuestions(questions.questions || []) : renderQuestionsPlaceholder()}
      </div>
    </div>
  `;

  // Event listeners
  container.querySelector('#generate-btn').addEventListener('click', () => {
    performQuestionGeneration(container, appState);
  });

  if (questions) {
    setupQuestionInteractions(container, questions.questions || []);
  }
}

function renderQuestionsPlaceholder() {
  return `
    <div class="card text-center" style="padding: 60px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">🎤</div>
      <h3 style="margin-bottom: 8px;">Ready to Practice?</h3>
      <p style="color: var(--text-secondary); margin-bottom: 8px;">Click "Generate Questions" to get personalized interview questions</p>
      <p style="color: var(--text-muted); font-size: 0.85rem;">Questions will be based on your specific experience, projects, and skills</p>
    </div>
  `;
}

function renderQuestions(questions, filter = 'all') {
  const filtered = filter === 'all' ? questions : questions.filter(q => q.category?.toLowerCase() === filter);

  if (filtered.length === 0) {
    return `
      <div class="card text-center" style="padding: 40px;">
        <p style="color: var(--text-secondary);">No ${filter} questions found.</p>
      </div>
    `;
  }

  return filtered.map((q, i) => `
    <div class="question-card" data-index="${q.id || i}" id="question-${q.id || i}">
      <div class="question-card-header">
        <span class="question-number">Q${q.id || i + 1}</span>
        <span class="question-badge badge-${q.category?.toLowerCase() || 'general'}">${q.category || 'General'}</span>
      </div>
      <div class="question-text">${q.question}</div>
      <div class="flex-between">
        <span style="font-size: 0.8rem; color: var(--text-muted);">Click to see suggested talking points</span>
        <button class="btn btn-sm btn-secondary copy-btn" data-question="${escapeHtml(q.question)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
      </div>
      <div class="question-tips">
        <div class="question-tips-content">
          <h4>💡 Suggested Talking Points</h4>
          <ul>
            ${(q.talkingPoints || []).map(tp => `<li>${tp}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `).join('');
}

function setupQuestionInteractions(container, questions) {
  // Toggle expand/collapse
  container.querySelectorAll('.question-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.copy-btn')) return;
      card.classList.toggle('expanded');
    });
  });

  // Copy buttons
  container.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.question;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Question copied!', 'success');
      });
    });
  });

  // Copy all
  container.querySelector('#copy-all-btn')?.addEventListener('click', () => {
    const allText = questions.map((q, i) =>
      `Q${i + 1} [${q.category}]: ${q.question}\nTalking Points:\n${(q.talkingPoints || []).map(t => `  - ${t}`).join('\n')}`
    ).join('\n\n---\n\n');
    navigator.clipboard.writeText(allText).then(() => {
      showToast('All questions copied!', 'success');
    });
  });

  // Filter tabs
  container.querySelectorAll('.tab[data-filter]').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      const contentDiv = container.querySelector('#questions-content');
      contentDiv.innerHTML = renderQuestions(questions, filter);
      // Re-setup interactions
      container.querySelectorAll('.question-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.copy-btn')) return;
          card.classList.toggle('expanded');
        });
      });
      container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(btn.dataset.question).then(() => showToast('Copied!', 'success'));
        });
      });
    });
  });
}

async function performQuestionGeneration(container, appState) {
  const contentDiv = container.querySelector('#questions-content');
  contentDiv.innerHTML = `
    <div class="card text-center" style="padding: 60px;">
      <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
      <h3>Generating interview questions...</h3>
      <p class="loading-text">Creating personalized questions based on your resume</p>
    </div>
  `;

  try {
    const result = await generateInterviewQuestions(appState.resumeText);
    appState.interviewQuestions = result;
    localStorage.setItem('resumeInterviewQuestions', JSON.stringify(result));

    if (isSupabaseConfigured()) {
      try { await saveAnalysis('interview', result); }
      catch (err) { console.warn('Supabase save failed:', err); }
    }

    // Re-render the whole page to include tabs and copy all button
    renderInterview(container, appState);
    showToast(`Generated ${result.questions?.length || 0} interview questions!`, 'success');
  } catch (error) {
    console.error('Interview question error:', error);
    contentDiv.innerHTML = `
      <div class="card text-center" style="padding: 40px; border-left: 3px solid var(--accent-danger);">
        <h3 style="color: var(--accent-danger); margin-bottom: 8px;">Generation Failed</h3>
        <p style="color: var(--text-secondary);">${error.message}</p>
        <button class="btn btn-primary mt-16" id="retry-gen">Try Again</button>
      </div>
    `;
    container.querySelector('#retry-gen')?.addEventListener('click', () => performQuestionGeneration(container, appState));
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML.replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
  const c = document.querySelector('#toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.3s ease'; setTimeout(() => t.remove(), 300); }, 3000);
}
