import { signIn, signUp } from '../api/supabase.js';

export function renderAuth(container, onAuthSuccess) {
  let isLogin = true;
  let isLoading = false;

  function render() {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h1 class="auth-title">CareerPilot</h1>
            <p class="auth-subtitle">${isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
          </div>

          <form id="auth-form" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="auth-email">Email</label>
              <input class="form-input" type="email" id="auth-email" placeholder="you@example.com" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label class="form-label" for="auth-password">Password</label>
              <input class="form-input" type="password" id="auth-password" placeholder="••••••••" required minlength="6" autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
            </div>
            <div id="auth-error" class="auth-error" style="display: none;"></div>
            <button type="submit" class="btn btn-primary btn-lg auth-submit" ${isLoading ? 'disabled' : ''}>
              ${isLoading ? '<div class="loading-spinner-sm"></div>' : ''}
              ${isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div class="auth-footer">
            <p>${isLogin ? "Don't have an account?" : 'Already have an account?'}
              <a href="#" id="auth-toggle" class="auth-toggle-link">${isLogin ? 'Sign Up' : 'Sign In'}</a>
            </p>
          </div>

          <div class="auth-divider">
            <span>or</span>
          </div>

          <button class="btn btn-secondary btn-lg auth-guest-btn" id="auth-guest">
            Continue as Guest
          </button>
          <p class="auth-guest-note">Guest data is stored locally and won't sync across devices.</p>
        </div>
      </div>
    `;

    // Event listeners
    container.querySelector('#auth-form').addEventListener('submit', handleSubmit);
    container.querySelector('#auth-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      render();
    });
    container.querySelector('#auth-guest').addEventListener('click', () => {
      onAuthSuccess(null); // null user = guest mode
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const email = container.querySelector('#auth-email').value.trim();
    const password = container.querySelector('#auth-password').value;
    const errorEl = container.querySelector('#auth-error');

    isLoading = true;
    render();

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const data = await signUp(email, password);
        if (data.user && !data.session) {
          // Email confirmation required
          errorEl.style.display = 'block';
          errorEl.style.color = 'var(--accent-success)';
          errorEl.textContent = 'Check your email to confirm your account, then sign in.';
          isLoading = false;
          isLogin = true;
          render();
          return;
        }
      }
      onAuthSuccess(true);
    } catch (err) {
      isLoading = false;
      render();
      const errorEl = container.querySelector('#auth-error');
      errorEl.style.display = 'block';
      errorEl.textContent = err.message || 'Authentication failed. Please try again.';
    }
  }

  render();
}
