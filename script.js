// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis for smooth scrolling (GSAP/Lenis website-inspired)
const lenis = new Lenis({
  duration: 2.2, // Much heavier, more cinematic (Lenis website uses 2.0+)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.8, // Slower response for more weight
  touchMultiplier: 1.5,
  infinite: false,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Integrate Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Utility: Text Scramble Effect (GSAP-style)
function scrambleText(element, finalText, duration = 1) {
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  let iteration = 0;
  const interval = setInterval(() => {
    element.textContent = finalText
      .split('')
      .map((char, index) => {
        if (index < iteration) return finalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');

    if (iteration >= finalText.length) clearInterval(interval);
    iteration += 1 / 3;
  }, 30);
}

// Utility: Split text into characters for animation
function splitTextToChars(element) {
  const text = element.textContent;
  element.innerHTML = text
    .split('')
    .map(char => `<span class="char" style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
    .join('');
  return element.querySelectorAll('.char');
}

// Global Cinematic Interactivity
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  const cursorDot = document.querySelector("#cursor-dot");
  const cursorFollower = document.querySelector("#cursor-follower");
  const magneticItems = document.querySelectorAll(".magnetic");

  // Custom Cursor (Desktop only)
  if (!isMobile && cursorDot && cursorFollower) {
    window.addEventListener("mousemove", (e) => {
      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
      gsap.to(cursorFollower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power3.out"
      });
    });
  }

  // Magnetic Interaction Engine
  magneticItems.forEach(item => {
    item.addEventListener("mousemove", (e) => {
      const bound = item.getBoundingClientRect();
      const strength = item.dataset.strength || 40;
      const x = e.clientX - bound.left - bound.width / 2;
      const y = e.clientY - bound.top - bound.height / 2;

      // Magnetic Pull
      gsap.to(item, {
        x: x * (strength / 100),
        y: y * (strength / 100),
        duration: 0.6,
        ease: "power2.out"
      });

      // Cursor Follower Scale
      gsap.to(cursorFollower, {
        scale: 2,
        borderColor: "rgba(0, 242, 255, 0.8)",
        duration: 0.3
      });
    });

    item.addEventListener("mouseleave", () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
      gsap.to(cursorFollower, {
        scale: 1,
        borderColor: "rgba(0, 242, 255, 0.3)",
        duration: 0.3
      });
    });
  });

  // Hero Reveal Engine (Simplified to preserve HTML structure)
  // complicated splitTextToChars removed to prevent destroying gradient spans
  // GSAP timeline below handles the animation via .reveal-text-stagger class

  // Ensure elements are visible immediately if JS fails or is slow
  // gsap.set([".reveal-text", ".reveal-text-stagger", ".magnetic"], { autoAlpha: 1 }); // DEBUG: Force visible

  // Hero Animation
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

  // Animate from hidden state
  gsap.fromTo(".reveal-text",
    { y: 50, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1.5, stagger: 0.2 }
  );

  gsap.fromTo(".reveal-text-stagger",
    { y: 50, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.1 },
    "-=1"
  );

  gsap.fromTo(".magnetic",
    { y: 50, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1, stagger: 0.05 },
    "-=0.8"
  );

  // Animated Counters for Hero Metrics (Integrated with GSAP Timeline)
  document.querySelectorAll('[data-counter]').forEach(counter => {
    const target = parseInt(counter.dataset.counter);
    const obj = { val: 0 };

    tl.to(obj, {
      val: target,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => {
        counter.textContent = Math.floor(obj.val) + '+';
      }
    }, "-=2"); // Start overlapping with recent animations
  });

  // Text Scramble on Nav Hover (GSAP-style, Desktop only)
  if (!isMobile) {
    document.querySelectorAll('nav a').forEach(link => {
      const originalText = link.textContent;
      link.addEventListener('mouseenter', () => {
        scrambleText(link, originalText, 0.5);
      });
    });
  }

  // Hero Parallax (Multi-layer, Lenis-style)
  gsap.to(".hero-bg-parallax", {
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    y: 200,
    scale: 1.3
  });

  // Scroll Progress Indicator (Lenis-style)
  const progressCircle = document.querySelector('#progress-circle');
  const progressText = document.querySelector('#progress-text');
  const circumference = 2 * Math.PI * 26; // 2πr where r=26

  lenis.on('scroll', ({ scroll, limit }) => {
    const progress = scroll / limit;
    const offset = circumference - (progress * circumference);

    if (progressCircle) {
      progressCircle.style.strokeDashoffset = offset;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(progress * 100)}%`;
    }
  });

  // Floating stickers drift
  gsap.to(".sticker", {
    y: "random(-15, 15)",
    x: "random(-10, 10)",
    rotation: "random(-3, 3)",
    duration: "random(3, 5)",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // Section titles reveal (EXCEPT Hero h1)
  gsap.utils.toArray('section:not(#hero) h1').forEach(h1 => {
    gsap.from(h1, {
      scrollTrigger: {
        trigger: h1,
        start: "top 90%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  // Experience bars animation
  gsap.from("#experience .h-full", {
    scrollTrigger: {
      trigger: "#experience",
      start: "top 70%",
    },
    width: 0,
    duration: 1.5,
    stagger: 0.1,
    ease: "expo.out"
  });
});

// Wait for all assets (images) to load before calculating  // Horizontal Scroll for Projects - REMOVED for Vertical Full-Screen

// Full-Screen Project Parallax & Snap
const projectPanels = gsap.utils.toArray(".project-panel");

if (projectPanels.length > 0) {
  projectPanels.forEach((panel, i) => {
    ScrollTrigger.create({
      trigger: panel,
      start: "top top",
      pin: true,
      pinSpacing: false
    });

    // Animate content on scroll
    gsap.from(panel.querySelector("h3"), {
      y: 50,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: panel,
        start: "top center",
        toggleActions: "play none none reverse"
      }
    });
  });
}

// Refresh ScrollTrigger to ensure all markers are correct
ScrollTrigger.refresh();

// Original toggleMenu for mobile
function toggleMenu() {
  const menu = document.querySelector("#mobile-menu");
  const bar1 = document.querySelector(".menu-bar-1");
  const bar2 = document.querySelector(".menu-bar-2");

  if (menu) {
    menu.classList.toggle("translate-x-full");
    bar1.classList.toggle("rotate-45");
    bar1.classList.toggle("translate-y-1");
    bar2.classList.toggle("-rotate-45");
    bar2.classList.toggle("-translate-y-1");
  }
}