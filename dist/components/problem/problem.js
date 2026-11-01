/* Problem story: initialize after component HTML is inserted by loader. */
(function initializeProblemStory() {
  document.querySelectorAll('.problem-story-card:not([data-initialized])').forEach(card => {
    const panels = [...card.querySelectorAll('[data-problem-panel]')];
    const steps = [...card.querySelectorAll('[data-problem-go]')];
    const current = card.querySelector('[data-problem-current]');
    const prev = card.querySelector('[data-problem-prev]');
    const next = card.querySelector('[data-problem-next]');
    if (!panels.length || panels.length !== steps.length || !current || !prev || !next) return;
    card.dataset.initialized = 'true';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0, timer = null, inView = false;
    let manualPause = false, hovered = false, focused = false;
    function show(index) {
      active = (index + panels.length) % panels.length;
      panels.forEach((panel, i) => {
        panel.classList.toggle('is-active', i === active);
        panel.hidden = i !== active;
      });
      steps.forEach((step, i) => {
        step.classList.toggle('is-active', i === active);
        if (i === active) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
      });
      current.textContent = String(active + 1).padStart(2, '0');
    }
    function stop() { if (timer !== null) clearInterval(timer); timer = null; }
    function play() {
      stop();
      if (!inView || document.hidden || manualPause || hovered || focused || motion.matches) return;
      timer = setInterval(() => show(active + 1), 8000);
    }
    function navigate(index) { manualPause = true; stop(); show(index); }
    prev.addEventListener('click', () => navigate(active - 1));
    next.addEventListener('click', () => navigate(active + 1));
    steps.forEach((step, i) => step.addEventListener('click', () => navigate(i)));
    card.addEventListener('mouseenter', () => { hovered = true; stop(); });
    card.addEventListener('mouseleave', () => { hovered = false; play(); });
    card.addEventListener('focusin', () => { focused = true; stop(); });
    card.addEventListener('focusout', event => {
      if (!card.contains(event.relatedTarget)) { focused = false; play(); }
    });
    document.addEventListener('visibilitychange', play);
    if (motion.addEventListener) motion.addEventListener('change', play);
    show(0);
    card.classList.add('is-ready');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        play();
      }, {threshold: .2});
      observer.observe(card);
    } else { inView = true; play(); }
  });
})();
