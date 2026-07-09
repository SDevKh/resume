import { analyzeCareerPath, isAPIConfigured } from '../api/gemini.js';
import { saveAnalysis, isSupabaseConfigured } from '../api/supabase.js';

export function renderCareerPath(container, appState) {
    if (!appState.resumeText) {
        container.innerHTML = `
            <div class="fade-in text-center" style="padding: 60px 20px;">
                <h2 style="margin-bottom: 16px;">No Resume Found</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Please upload your resume on the dashboard first.</p>
                <button class="btn btn-primary" onclick="window.navigateTo('dashboard')">Go to Dashboard</button>
            </div>
        `;
        return;
    }

    if (!isAPIConfigured()) {
        container.innerHTML = `
            <div class="fade-in card" style="text-align: center; padding: 40px 20px;">
                <h2 style="margin-bottom: 16px;">API Key Required</h2>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Please add your Groq API key to the .env file to generate career insights.</p>
                <button class="btn btn-primary" onclick="window.navigateTo('dashboard')">Go Back</button>
            </div>
        `;
        return;
    }

    // Determine if we need to generate or show existing
    if (!appState.careerPath) {
        renderLoadingState(container);
        performCareerAnalysis(container, appState);
    } else {
        renderResults(container, appState);
    }
}

function renderLoadingState(container) {
    container.innerHTML = `
        <div class="fade-in card text-center" style="padding: 60px 20px;">
            <div class="loading-spinner" style="margin: 0 auto 24px; border-top-color: var(--accent-primary);"></div>
            <h2 style="margin-bottom: 12px;">Discovering Your Maximum Earning Potential...</h2>
            <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">
                Our AI is analyzing your skills and experience to find the most lucrative career paths and exact steps required to get there.
            </p>
        </div>
    `;
}

async function performCareerAnalysis(container, appState) {
    try {
        const result = await analyzeCareerPath(appState.resumeText);
        appState.careerPath = result;
        localStorage.setItem('resumeCareerPath', JSON.stringify(result));

        if (isSupabaseConfigured()) {
            try { await saveAnalysis('careerpath', result); }
            catch (err) { console.warn('Supabase save failed:', err); }
        }

        renderResults(container, appState);
        showToast('Career insights generated successfully!', 'success');
    } catch (error) {
        container.innerHTML = `
            <div class="fade-in card text-center" style="padding: 60px 20px; border-color: var(--accent-danger);">
                <h2 style="color: var(--accent-danger); margin-bottom: 16px;">Analysis Failed</h2>
                <p style="margin-bottom: 24px;">${error.message}</p>
                <button class="btn btn-primary" id="retry-btn">Retry Analysis</button>
            </div>
        `;

        const retryBtn = container.querySelector('#retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                renderLoadingState(container);
                performCareerAnalysis(container, appState);
            });
        }
    }
}

function renderResults(container, appState) {
    const data = appState.careerPath;

    if (!data || !data.paths) {
        container.innerHTML = `
            <div class="fade-in card text-center">
                <h3>Invalid data received. Please try regenerating.</h3>
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="appState.careerPath=null; renderCareerPath(document.getElementById('main-content'), appState)">Regenerate</button>
            </div>
        `;
        return;
    }

    const pathsHtml = data.paths.map((path, index) => `
        <div class="card fade-in stagger-${index + 1} mb-24" style="border-left: 4px solid var(--accent-primary);">
            <div class="flex justify-between" style="align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 style="color: var(--text-primary); font-size: 1.5rem; margin-bottom: 4px;">${path.roleLabel}</h2>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">${path.matchReason}</p>
                </div>
                <div style="background: rgba(228, 255, 48, 0.1); padding: 8px 16px; border-radius: 30px; border: 1px solid rgba(228, 255, 48, 0.2);">
                    <span style="color: var(--accent-primary); font-weight: 800; font-size: 1.2rem;">${path.salaryRange}</span>
                </div>
            </div>

            <div class="grid grid-2 gap-24 mt-24">
                <!-- Skills Gap -->
                <div>
                    <h3 style="font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warning)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Skills to Bridge the Gap
                    </h3>
                    <ul style="list-style: none; padding: 0;">
                        ${path.skillsToAcquire.map(skill => `
                            <li style="padding: 8px 12px; background: var(--bg-input); border-radius: 6px; margin-bottom: 8px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                                <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary);"></div>
                                ${skill}
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Learning Path -->
                <div>
                    <h3 style="font-size: 1.1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        Learning Path
                    </h3>
                    <div style="padding-left: 12px; border-left: 2px solid var(--border-color); display: flex; flex-direction: column; gap: 16px;">
                        ${path.learningPath.map(step => `
                            <div style="position: relative;">
                                <div style="position: absolute; left: -19px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: var(--bg-card); border: 2px solid var(--accent-primary);"></div>
                                <span style="font-size: 0.75rem; color: var(--accent-primary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Step ${step.step}</span>
                                <p style="font-size: 0.9rem; margin-top: 4px; color: var(--text-primary);">${step.action}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Where to Apply -->
            <div class="mt-24 pt-24" style="border-top: 1px dashed var(--border-color);">
                <h3 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Top Industries to Target
                </h3>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${path.whereToApply.map(target => `
                        <span style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                            ${target}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="fade-in">
            <div class="page-header flex justify-between align-center" style="margin-bottom: 32px;">
                <div>
                    <h1>Career <span class="gradient-text">Insights</span></h1>
                    <p>AI-powered career paths tailored to maximize your earning potential.</p>
                </div>
                <button class="btn btn-secondary" id="regenerate-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    Regenerate Paths
                </button>
            </div>
            
            <div class="paths-container">
                ${pathsHtml}
            </div>
        </div>
    `;

    // Event Listeners
    const regenBtn = container.querySelector('#regenerate-btn');
    if (regenBtn) {
        regenBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to regenerate your career paths? This will overwrite the current suggestions.')) {
                appState.careerPath = null;
                renderCareerPath(container, appState);
            }
        });
    }
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
