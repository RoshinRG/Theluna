
(function () {
  const bar = document.getElementById('loading-bar');
  const screen = document.getElementById('loading-screen');
  let progress = 0;

  const interval = setInterval(() => {
    
    if (progress < 80) {
      progress += Math.random() * 8 + 2;
    } else if (progress < 95) {
      progress += Math.random() * 0.5;
    }
    progress = Math.min(progress, 95);
    if (bar) bar.style.width = progress + '%';
  }, 150);

  window.addEventListener('load', () => {
    clearInterval(interval);
    
    if (bar) bar.style.width = '100%';

    setTimeout(() => {
      if (screen) screen.classList.add('hidden');
      
      setTimeout(() => {
        if (screen) screen.remove();
      }, 900);
    }, 400);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  
  const root = document.documentElement;

  document.addEventListener('mousemove', (e) => {
    
    root.style.setProperty('--cursor-x', `${e.clientX}px`);
    root.style.setProperty('--cursor-y', `${e.clientY}px`);
  });

  const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  const nav = document.getElementById('spotlight-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  nav.addEventListener('mousemove', (e) => {
    const rect = nav.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    nav.style.setProperty('--spotlight-x', `${x}px`);
  });

  function updateNavAmbience(activeLink) {
    if (!activeLink) return;

    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');

    const linkRect = activeLink.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    const relativeLeft = linkRect.left - navRect.left;
    const width = linkRect.width;

    nav.style.setProperty('--ambience-x', `${relativeLeft}px`);
    nav.style.setProperty('--ambience-width', `${width}px`);
  }

  const sections = document.querySelectorAll('.spa-section');

  function handleRoute() {
    
    const hash = window.location.hash.substring(1) || 'home';

    sections.forEach(section => {
      section.classList.remove('spa-visible');
    });

    const targetSection = document.getElementById(hash);
    if (targetSection) {
      targetSection.classList.add('spa-visible');

      const sectionTitle = hash.charAt(0).toUpperCase() + hash.slice(1);
      document.title = hash === 'home' ? "Luna's World - A Magical Author Universe" : `${sectionTitle} | Luna's World`;
    }

    const activeLink = document.querySelector(`.nav-link[data-target="${hash}"]`);
    if (activeLink) {
      updateNavAmbience(activeLink);
    }

    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', handleRoute);

  setTimeout(handleRoute, 100);

  const fadeElements = document.querySelectorAll('.fade-in-up');
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => fadeObserver.observe(el));

  const astraToggle = document.getElementById('astra-toggle');
  const astraPanel = document.getElementById('astra-panel');
  const astraClose = document.getElementById('astra-close');
  const astraInputForm = document.getElementById('astra-input-form');
  const astraInput = document.getElementById('astra-input');
  const astraMessages = document.getElementById('astra-messages');

  function toggleAstra() {
    const isOpen = astraPanel.classList.contains('open');
    if (isOpen) {
      astraPanel.classList.remove('open');
      astraPanel.inert = true;
      astraToggle.setAttribute('aria-expanded', 'false');
    } else {
      astraPanel.classList.add('open');
      astraPanel.inert = false;
      astraToggle.setAttribute('aria-expanded', 'true');
      setTimeout(() => astraInput.focus(), 300);
    }
  }

  astraToggle.addEventListener('click', toggleAstra);
  astraClose.addEventListener('click', toggleAstra);

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function appendMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${isUser ? 'user-msg' : 'astra-msg'}`;
    
    msgDiv.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div>`;

    const typingIndicator = document.getElementById('astra-typing-indicator');
    if (typingIndicator) {
      astraMessages.insertBefore(msgDiv, typingIndicator);
    } else {
      astraMessages.appendChild(msgDiv);
    }
    
    astraMessages.scrollTop = astraMessages.scrollHeight;
  }

  const astraHistory = [
    {
      "role": "system",
      "content": "You are ASTRA, a friendly and magical AI assistant for G Daffini Shiyalin (Luna), a cosmic poet and storyteller. Luna has published poetry like 'Whispers of Earth', 'She Became In Silence', and is writing 'The Hidden Bloodline' on Wattpad. Keep answers very brief (1-3 sentences), poetic, and cosmic. Guide users to her books, poetry, or contact sections. Do not use complex markdown formatting."
    }
  ];

  async function getAstraResponse(input) {
    astraHistory.push({ "role": "user", "content": input });

    if (astraHistory.length > 11) {
      
      astraHistory.splice(1, astraHistory.length - 11);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 

      const response = await fetch("/api/astra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          messages: astraHistory
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
           throw new Error("RateLimit");
        }
        throw new Error("API response was not ok");
      }

      const data = await response.json();
      let reply = data.choices[0].message.content;

      reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      
      reply = reply.replace(/<think>[\s\S]*/gi, '').trim();

      astraHistory.push({ "role": "assistant", "content": reply });
      return reply;
      
    } catch (error) {
      console.error("ASTRA API Error:", error);
      astraHistory.pop(); 
      
      if (error.name === 'AbortError') {
         return "The stars are taking too long to align... The connection timed out. Please try again.";
      }
      if (error.message === "RateLimit") {
         return "I'm feeling a little overwhelmed by the cosmic energy! Please wait a moment before asking again.";
      }
      return "The cosmic connection is weak right now... I'm having trouble thinking. Please try again later!";
    }
  }

  astraInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = astraInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    astraInput.value = '';

    const typingIndicator = document.getElementById('astra-typing-indicator');
    if (typingIndicator) {
      typingIndicator.style.display = 'flex';
      astraMessages.scrollTop = astraMessages.scrollHeight;
    }

    const response = await getAstraResponse(text);

    if (typingIndicator) {
      typingIndicator.style.display = 'none';
    }

    appendMessage(response, false);
  });

  const comingSoonLinks = document.querySelectorAll('.coming-soon-link');
  comingSoonLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      alert("This magic is still being woven. Check back soon!");
    });
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const honeypot = document.getElementById('honeypot_field');
      if (honeypot && honeypot.value) {
        
        return;
      }

      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      const originalText = submitBtn.innerText;
      submitBtn.innerText = "Sending...";
      submitBtn.disabled = true;

      setTimeout(() => {
        
        submitBtn.innerText = "Message Sent! ✨";
        submitBtn.style.background = "var(--bg-mid)";

        contactForm.reset();
        
        setTimeout(() => {
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
          submitBtn.style.background = "";
        }, 3000);
      }, 1000);
    });
  }

  const gridCards = document.querySelectorAll('.cards-grid .glass-card');
  const modal = document.getElementById('expandable-modal');
  const backdrop = document.getElementById('expandable-backdrop');
  const closeBtn = document.getElementById('expandable-close');
  
  const modalImg = document.getElementById('expandable-image');
  const modalTitle = document.getElementById('expandable-title');
  const modalMeta = document.getElementById('expandable-meta');
  const modalDesc = document.getElementById('expandable-description');
  const modalLink = document.getElementById('expandable-link');

  function openModal(card) {
    
    const imgEl = card.querySelector('.card-image img');
    const titleEl = card.querySelector('h3');
    const metaEl = card.querySelector('.meta');
    const descEl = card.querySelector('.description');
    const linkEl = card.querySelector('.card-action a');

    if (imgEl) {
      modalImg.src = imgEl.src;
      modalImg.alt = imgEl.alt;
      modalImg.parentElement.style.display = 'flex';
    } else {
      modalImg.parentElement.style.display = 'none';
    }
    
    modalTitle.textContent = titleEl ? titleEl.textContent : '';
    modalMeta.innerHTML = metaEl ? metaEl.innerHTML : '';
    modalDesc.textContent = descEl ? descEl.textContent : '';
    
    if (linkEl) {
      modalLink.href = linkEl.href;
      modalLink.textContent = linkEl.textContent;
      modalLink.style.display = 'inline-block';

      if (linkEl.classList.contains('coming-soon-link')) {
        modalLink.classList.add('coming-soon-link');
        modalLink.href = "#";
      } else {
        modalLink.classList.remove('coming-soon-link');
      }
    } else {
      modalLink.style.display = 'none';
    }

    modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.inert = false;
  }

  function closeModal() {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    modal.inert = true;
  }

  gridCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  gridCards.forEach(card => {
    const links = card.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        
        e.stopPropagation();
      });
    });
  });

  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
