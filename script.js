/* =========================================================
   PORTFOLIO LANDING PAGE — SCRIPT
   Handles: ambient canvas background, scroll-reveal animations,
   back-to-top button, smooth scroll, current year in footer.
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll-reveal for "fade-in-on-scroll" elements ---------- */
  var revealEls = document.querySelectorAll('.fade-in-on-scroll');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // Small stagger for a smoother group reveal
            setTimeout(function () {
              entry.target.classList.add('is-visible');
            }, i * 60);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // No IntersectionObserver support, or user prefers reduced motion:
    // just show everything immediately.
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Back to top button ---------- */
  var backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    var toggleBackToTop = function () {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Ambient background: lightweight constellation of dots ----------
     Purely decorative. Skips entirely if the user prefers reduced motion,
     or pauses automatically when the tab is hidden to save battery/CPU. */
  var canvas = document.getElementById('bg-canvas');

  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width, height, dots, animationId;
    var isTabVisible = true;

    // Reads the current dot color from CSS custom properties so it
    // automatically matches light/dark mode without extra JS logic.
    function getDotColor() {
      var value = getComputedStyle(document.documentElement)
        .getPropertyValue('--dot-color')
        .trim();
      return value || '0, 0, 0';
    }

    function resize() {
      width = canvas.clientWidth = window.innerWidth;
      height = canvas.clientHeight = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initDots();
    }

    function initDots() {
      // Density scales gently with screen area, capped for performance.
      var count = Math.min(70, Math.floor((width * height) / 18000));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.4 + 0.6
        });
      }
    }

    function step() {
      if (!isTabVisible) { animationId = requestAnimationFrame(step); return; }

      ctx.clearRect(0, 0, width, height);
      var rgb = getDotColor();
      var maxLinkDist = Math.min(160, width / 6);

      // Update positions
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;
      }

      // Draw connecting lines between nearby dots
      ctx.lineWidth = 1;
      for (var a = 0; a < dots.length; a++) {
        for (var b = a + 1; b < dots.length; b++) {
          var dx = dots[a].x - dots[b].x;
          var dy = dots[a].y - dots[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDist) {
            var opacity = (1 - dist / maxLinkDist) * 0.12;
            ctx.strokeStyle = 'rgba(' + rgb + ', ' + opacity + ')';
            ctx.beginPath();
            ctx.moveTo(dots[a].x, dots[a].y);
            ctx.lineTo(dots[b].x, dots[b].y);
            ctx.stroke();
          }
        }
      }

      // Draw dots on top
      for (var j = 0; j < dots.length; j++) {
        var dot = dots[j];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb + ', 0.35)';
        ctx.fill();
      }

      animationId = requestAnimationFrame(step);
    }

    document.addEventListener('visibilitychange', function () {
      isTabVisible = !document.hidden;
    });

    // Also re-check color when system theme changes live.
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        /* color is re-read every frame via getDotColor(), nothing else needed */
      });
    }

    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 150);
    });

    resize();
    animationId = requestAnimationFrame(step);
  }

})();
