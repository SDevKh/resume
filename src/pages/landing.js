export function renderLanding(onEnterApp) {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="landing-page">
      <!-- Floating Navbar -->
      <nav class="landing-nav" id="landing-navbar">
        <a href="#" class="landing-nav-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          CareerPilot
        </a>
        <div class="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <a href="#" class="landing-nav-cta" id="nav-launch-btn">Launch App →</a>
      </nav>

      <!-- Hero Section -->
      <section class="landing-hero" id="hero">
        <div class="hero-badge">
          <span class="stars">★★★★★</span>
          <span>Trusted by smart job seekers</span>
        </div>
        <h1 class="hero-title">
          Resumes are
          <br>boring
          <span class="hero-title-accent">Not Anymore!</span>
        </h1>
        <p class="hero-subtitle">
          Stop guessing. Let AI analyze your resume, find skill gaps,
          and generate interview questions tailored to <em>your</em> experience.
          All free. All instant.
        </p>
        <div class="hero-cta-group">
          <button class="hero-btn-primary" id="hero-launch-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            Analyze My Resume
          </button>
          <a href="#features" class="hero-btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            See How It Works
          </a>
        </div>
        <p class="hero-free-text">100% free • No sign-up required • Powered by AI</p>

        <!-- Hero Mockup Visual -->
        <div class="hero-visual">
          <div class="hero-mockup">
            <div class="mockup-header">
              <div class="mockup-dot"></div>
              <div class="mockup-dot"></div>
              <div class="mockup-dot"></div>
            </div>
            <div class="mockup-content">
              <div class="mockup-card">
                <h4>Resume Score</h4>
                <div class="mockup-score">87%</div>
                <div class="mockup-bar"><div class="mockup-bar-fill" style="width: 87%"></div></div>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Above average — strong candidate</p>
              </div>
              <div class="mockup-card">
                <h4>Skills Detected</h4>
                <div style="margin-top: 8px;">
                  <span class="mockup-tag">JavaScript</span>
                  <span class="mockup-tag">React</span>
                  <span class="mockup-tag">Node.js</span>
                  <span class="mockup-tag">Python</span>
                  <span class="mockup-tag">AWS</span>
                  <span class="mockup-tag">Docker</span>
                </div>
              </div>
              <div class="mockup-card" style="grid-column: 1 / -1;">
                <h4>AI Interview Question</h4>
                <p style="font-size: 0.95rem; color: var(--text-primary); margin-top: 8px; line-height: 1.6;">
                  "Tell me about a time you optimized a system's performance at scale. 
                  What was the challenge, and how did you measure success?"
                </p>
                <div style="margin-top: 12px;">
                  <span class="mockup-tag" style="background: rgba(99,102,241,0.1); color: var(--accent-primary-light); border-color: rgba(99,102,241,0.2);">Behavioral</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 8px;">Based on your experience at TechCorp</span>
                </div>
              </div>
            </div>
            <div class="mockup-ai-badge">
              <div class="mockup-ai-dot"></div>
              AI • Llama 3.3 70B
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="landing-section" id="features">
        <div class="reveal">
          <span class="section-label">Features</span>
          <h2 class="section-title">Everything you need<br>to land your <span style="color: var(--neon-green)">dream job</span></h2>
          <p class="section-subtitle">Upload once, get instant insights across every dimension of your resume.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card reveal">
            <div class="feature-icon green">📊</div>
            <h3>AI Resume Scoring</h3>
            <p>Get an overall score with section-by-section breakdown. Know exactly where your resume stands and what to fix.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-icon purple">🎤</div>
            <h3>Interview Q Generator</h3>
            <p>Generates personalized interview questions from your resume to help you practice. Each comes with talking points.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-icon cyan">🗺️</div>
            <h3>Skill Gap Analysis</h3>
            <p>Enter your target role and instantly see which skills you're missing, plus curated learning resources.</p>
          </div>
          <div class="feature-card reveal">
            <div class="feature-icon amber">🤖</div>
            <h3>ATS Compatibility</h3>
            <p>Check how well your resume passes Applicant Tracking Systems. Optimize keywords and formatting for maximum visibility.</p>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="landing-section" id="how-it-works">
        <div class="text-center reveal">
          <span class="section-label">How It Works</span>
          <h2 class="section-title" style="text-align: center;">Three steps to<br><span style="color: var(--neon-green)">career clarity</span></h2>
        </div>

        <div class="how-it-works-grid">
          <div class="step-card reveal">
            <div class="step-number">1</div>
            <h3>Upload Your Resume</h3>
            <p>Drag and drop your PDF resume. We extract every detail in seconds.</p>
          </div>
          <div class="step-card reveal">
            <div class="step-number">2</div>
            <h3>AI Analyzes It</h3>
            <p>Our AI reads your resume and provides scores, insights, and suggestions.</p>
          </div>
          <div class="step-card reveal">
            <div class="step-number">3</div>
            <h3>Practice & Improve</h3>
            <p>Get interview questions, close skill gaps, and polish your resume to perfection.</p>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="landing-section" id="testimonials">
        <div class="reveal">
          <span class="section-label">Testimonials</span>
          <h2 class="section-title">What our users<br><span style="color: var(--neon-green)">say about us</span></h2>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card reveal">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"The interview question generator is insanely useful. It pulled questions directly from my project experience — felt like a real mock interview!"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">RK</div>
              <div class="testimonial-author-info">
                <h4>Rahul K.</h4>
                <p>Software Engineer</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card reveal">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"I uploaded my resume and in 10 seconds got a full breakdown. Found out my ATS score was low — fixed it and got callbacks the same week."</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">SP</div>
              <div class="testimonial-author-info">
                <h4>Sarah P.</h4>
                <p>Product Manager</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card reveal">
            <div class="testimonial-stars">★★★★★</div>
            <p class="testimonial-text">"The skill gap feature helped me figure out exactly what certifications I needed for my target role. Landed the job 2 months later!"</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">AJ</div>
              <div class="testimonial-author-info">
                <h4>Amit J.</h4>
                <p>Data Analyst</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="landing-cta reveal">
        <h2 class="cta-title">Ready to upgrade<br>your <span style="color: var(--neon-green)">resume?</span></h2>
        <p class="cta-subtitle">Upload your resume now and get AI-powered insights in seconds. No sign-up, no payment, no BS.</p>
        <button class="hero-btn-primary" id="cta-launch-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Launch CareerPilot — It's Free
        </button>
        <p class="hero-free-text" style="margin-top: 20px;">No credit card • No sign-up • Works instantly</p>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>CareerPilot © 2026 — Built with ❤️ and AI. Free forever.</p>
      </footer>
    </div>
  `;

  // Event listeners for "Launch App" buttons
  const launchButtons = ['#hero-launch-btn', '#nav-launch-btn', '#cta-launch-btn'];
  launchButtons.forEach(selector => {
    app.querySelector(selector)?.addEventListener('click', (e) => {
      e.preventDefault();
      onEnterApp();
    });
  });

  // Smooth scroll for anchor links
  app.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.id && ['nav-launch-btn', 'hero-launch-btn', 'cta-launch-btn'].includes(link.id)) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Scroll reveal animation
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  app.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
