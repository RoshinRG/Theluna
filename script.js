// Three.js is loaded lazily on first user interaction to avoid blocking LCP.
// The loading screen has been removed — content is visible immediately.
(function setupLazyThreeJS() {
  var loaded = false;
  function loadThreeJS() {
    if (loaded) return;
    loaded = true;
    import('./three/main.js').catch(console.error);
  }
  ['mousemove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(function(ev) {
    window.addEventListener(ev, loadThreeJS, { once: true, passive: true });
  });
  // Fallback: load Three.js 8s after page ready if no interaction
  setTimeout(loadThreeJS, 8000);
}());
document.addEventListener("DOMContentLoaded", () => {
    const e = document.documentElement;
    document.addEventListener("mousemove", (t) => {
      (e.style.setProperty("--cursor-x", `${t.clientX}px`),
        e.style.setProperty("--cursor-y", `${t.clientY}px`));
    }, { passive: true });
    document
      .querySelectorAll("a, button, input, textarea, .glass-card")
      .forEach((e) => {
        (e.addEventListener("mouseenter", () =>
          document.body.classList.add("hovering"),
        ),
          e.addEventListener("mouseleave", () =>
            document.body.classList.remove("hovering"),
          ));
      });
    const t = document.getElementById("spotlight-nav"),
      n = document.querySelectorAll(".nav-link");
    let navRafId = null;
    t.addEventListener("mousemove", (e) => {
      const clientX = e.clientX;
      if (navRafId) cancelAnimationFrame(navRafId);
      navRafId = requestAnimationFrame(() => {
        const n = t.getBoundingClientRect(),
          o = clientX - n.left;
        t.style.setProperty("--spotlight-x", `${o}px`);
      });
    }, { passive: true });
    const o = document.querySelectorAll(".spa-section");
    function s() {
      const e = window.location.hash.substring(1) || "home";
      document.body.dataset.section = e;
      o.forEach((section) => {
        const isActive = section.id === e;
        if (!isActive) {
          section.classList.remove("spa-visible");
          section.setAttribute("aria-hidden", "true");
          section.inert = true;
        }
      });
      const s = document.getElementById(e);
      if (s) {
        if (!s.classList.contains("spa-visible")) {
          requestAnimationFrame(() => {
            s.classList.add("spa-visible");
            s.removeAttribute("aria-hidden");
            s.inert = false;
            s.querySelectorAll(".fade-in-up").forEach((el) => el.classList.add("visible"));
          });
        } else {
          s.removeAttribute("aria-hidden");
          s.inert = false;
        }
        const t = e.charAt(0).toUpperCase() + e.slice(1);
        document.title =
          "home" === e
            ? "Luna's World - A Magical Author Universe"
            : `${t} | Luna's World`;
      }
      const a = document.querySelector(`.nav-link[data-target="${e}"]`);
      (a &&
        (function (e) {
          if (!e) return;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const o = e.getBoundingClientRect(),
                s = t.getBoundingClientRect(),
                a = o.left - s.left,
                i = o.width;
              n.forEach((e) => e.classList.remove("active"));
              e.classList.add("active");
              t.style.setProperty("--ambience-x", `${a}px`);
              t.style.setProperty("--ambience-width", `${i}px`);
            });
          });
        })(a),
        window.scrollTo(0, 0));
    }
    window.addEventListener("hashchange", s);
    s();
    document.addEventListener("lunaReady", s);
    const a = document.querySelectorAll(".fade-in-up"),
      i = new IntersectionObserver(
        (e, t) => {
          e.forEach((e) => {
            e.isIntersecting &&
              (e.target.classList.add("visible"), t.unobserve(e.target));
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );
    a.forEach((e) => i.observe(e));
    const r = document.getElementById("astra-toggle"),
      c = document.getElementById("astra-panel"),
      l = document.getElementById("astra-close"),
      d = document.getElementById("astra-input-form"),
      m = document.getElementById("astra-input"),
      u = document.getElementById("astra-messages");

    let isAstraSending = false;

    function renderAstraResponse(text) {
      const div = document.createElement("div");
      div.textContent = text;
      let escaped = div.innerHTML;
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
      escaped = escaped.replace(/\n/g, "<br>");
      return escaped;
    }

    if (r && c && l && d && m && u) {
      function g() {
        c.classList.contains("open")
          ? (c.classList.remove("open"),
            (c.inert = !0),
            r.setAttribute("aria-expanded", "false"))
          : (c.classList.add("open"),
            (c.inert = !1),
            r.setAttribute("aria-expanded", "true"),
            setTimeout(() => m.focus(), 300));
      }
      function y(e, t = !1) {
        const n = document.createElement("div");
        ((n.className = "msg " + (t ? "user-msg" : "astra-msg")),
          (n.innerHTML = `<div class="msg-bubble">${t ? (function (e) {
            const t = document.createElement("div");
            return ((t.textContent = e), t.innerHTML);
          })(e) : renderAstraResponse(e)}</div>`));
        const o = document.getElementById("astra-typing-indicator");
        (o ? u.insertBefore(n, o) : u.appendChild(n),
          (u.scrollTop = u.scrollHeight));
      }
      (r.addEventListener("click", g), l.addEventListener("click", g));
      const p = [
        {
          role: "system",
          content:
            "You are ASTRA, a friendly and magical AI assistant for G Daffini Shiyalin (Luna), a cosmic poet and storyteller. Luna has published poetry like 'Whispers of Earth', 'She Became In Silence', and is writing 'The Hidden Bloodline' on Wattpad. Keep answers very brief (1-3 sentences), poetic, and cosmic. Guide users to her books, poetry, or contact sections. Do not use complex markdown formatting.",
        },
      ];
      d.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isAstraSending) return;
        const t = m.value.trim();
        if (!t) return;
        isAstraSending = true;
        (y(t, !0), (m.value = ""));
        const n = document.getElementById("astra-typing-indicator");
        if (n) { requestAnimationFrame(() => { n.style.display = "flex"; requestAnimationFrame(() => u.scrollTop = u.scrollHeight); }); }
        const o = await (async function (e) {
          (p.push({ role: "user", content: e }),
            p.length > 11 && p.splice(1, p.length - 11));
          try {
            const e = new AbortController(),
              t = setTimeout(() => e.abort(), 15e3),
              n = await fetch("/api/astra", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({ messages: p }),
                signal: e.signal,
              });
            if (!n.ok) {
              throw new Error("API response was not ok");
            }
            
            const data = await n.json();
            const o = data.reply;
            
            p.push({ role: "assistant", content: o });
            return o;
          } catch (e) {
            console.error("ASTRA API Error:", e);
            p.pop();
            return "The cosmic connection is weak right now... I'm having trouble thinking. Please try again later!";
          }
        })(t);
        (n && (n.style.display = "none"), y(o, !1));
        isAstraSending = false;
      });
    }
    document.querySelectorAll(".coming-soon-link").forEach((e) => {
      e.addEventListener("click", (e) => {
        (e.preventDefault(),
          alert("This magic is still being woven. Check back soon!"));
      });
    });
    const h = document.getElementById("contact-form");
    if (h) {
      const e = h.querySelector('button[type="submit"]');
      h.addEventListener("submit", async (t) => {
        t.preventDefault();
        const n = document.getElementById("honeypot_field");
        if (n && n.value) return;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;
        const o = e.innerText;
        ((e.innerText = "Sending..."), (e.disabled = !0));

        try {
          const googleScriptUrl = "https://script.google.com/macros/s/AKfycbyi8kjDjZ4SpE9xnvBO4Gnr6z3fLADdp54dWmhAl22ogBWY5YjADxjlJDWOiM5h8XqN/exec";
          
          if (googleScriptUrl === "YOUR_GOOGLE_SCRIPT_URL") {
            console.warn("Contact form: Google Script URL not configured.");
            e.innerText = "Setup Required";
            return;
          }

          const params = new URLSearchParams();
          params.append("email", email);
          params.append("message", message);

          await fetch(googleScriptUrl, {
            method: "POST",
            body: params,
            mode: "no-cors" // Required for Google Apps Script Web Apps
          });

          e.innerText = "Message Sent! ✨";
          e.style.background = "var(--bg-mid)";
          h.reset();
        } catch (err) {
          console.error("Contact form error:", err);
          e.innerText = "Error Sending";
        } finally {
          setTimeout(() => {
            ((e.innerText = o),
              (e.disabled = !1),
              (e.style.background = ""));
          }, 3e3);
        }
      });
    }
    const v = document.querySelectorAll(".cards-grid .glass-card"),
      E = document.getElementById("expandable-modal"),
      f = document.getElementById("expandable-backdrop"),
      b = document.getElementById("expandable-close"),
      L = document.getElementById("expandable-image"),
      x = document.getElementById("expandable-title"),
      I = document.getElementById("expandable-meta"),
      k = document.getElementById("expandable-description"),
      w = document.getElementById("expandable-link");
    function B() {
      (E.classList.remove("open"),
        f.classList.remove("open"),
        (document.body.style.overflow = ""),
        (E.inert = !0));
    }
    (v.forEach((e) => {
      e.addEventListener("click", () =>
        (function (e) {
          const t = e.querySelector(".card-image img"),
            n = e.querySelector("h3"),
            o = e.querySelector(".meta") || e.querySelector(".card-tag"),
            s = e.querySelector(".description"),
            a = e.querySelector(".card-action a, .card-action button");
          (t
            ? ((L.src = t.src),
              (L.alt = t.alt),
              (L.parentElement.style.display = "flex"))
            : (L.parentElement.style.display = "none"),
            (x.textContent = n ? n.textContent : ""),
            (I.innerHTML = o ? (o.classList.contains("card-tag") ? `<strong>${o.textContent}</strong>` : o.innerHTML) : ""),
            (k.textContent = s ? s.textContent : ""),
            a
              ? ((w.href = a.href),
                (w.textContent = a.textContent),
                (w.style.display = "inline-block"),
                a.classList.contains("coming-soon-link")
                  ? (w.classList.add("coming-soon-link"), (w.href = "#"))
                  : w.classList.remove("coming-soon-link"))
              : (w.style.display = "none"),
            E.classList.add("open"),
            f.classList.add("open"),
            (document.body.style.overflow = "hidden"),
            (E.inert = !1));
        })(e),
      );
    }),
      b.addEventListener("click", B),
      f.addEventListener("click", B),
      w.addEventListener("click", (e) => {
        if (w.classList.contains("coming-soon-link")) {
          e.preventDefault();
          alert("This magic is still being woven. Check back soon!");
        }
      }),
      document.addEventListener("keydown", (e) => {
        "Escape" === e.key && E.classList.contains("open") && B();
      }),
      v.forEach((e) => {
        e.querySelectorAll("a").forEach((e) => {
          e.addEventListener("click", (e) => {
            e.stopPropagation();
          });
        });
      }));
    const T = document.getElementById("current-year");
    T && (T.textContent = new Date().getFullYear());

    // Magical Star Click Effect
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) return; // Desktop only
      
      const star = document.createElement("div");
      star.className = "click-star";
      star.textContent = "✦"; // U+2726 Black Four Pointed Star
      star.style.left = `${e.clientX}px`;
      star.style.top = `${e.clientY}px`;
      document.body.appendChild(star);
      
      // Remove star after animation (0.7s)
      setTimeout(() => {
        star.remove();
      }, 700);
    });
  });

/* ════════════════════════════════════════════════════════════════
   POETRY — bookshelf cards + open-book read view
════════════════════════════════════════════════════════════════ */
const poems = [
  {
    entry: 1,
    title: "WARMTH THAT BURNED",
    genre: "Emotional Poetry",
    cover: "assets/optimized/Warmth_That_Burned.webp",
    excerpt: "The light had finally found its way to that soul. She stood between two fires — one that could warm her, one that could destroy her.",
    verses: `The light had finally found its way to that soul.

She lived within a cage, unaware of the sword she was destined to wield. Her eyes still gleamed with innocence when the clock struck twelve.

And then, the rain clouds parted.

A silver light revealed itself to the moon. It was beautiful, yet cold. The cold settled along her spine like winter's fingers.

Just as the tides answered the moon's call, she answered the call of a place she hoped would finally grant her solace.

But she was cursed.

Her blood belonged to the stars, and her soul was made of glass and dust.

Her comfort had vanished.

So had her smile.

Far in the distance, a small light flickered.

A firefly, she thought.

And for the first time in a long while, she allowed herself to believe in goodness.

Guided by moonlight, she followed it into the woods.

The deeper she wandered, the thicker the forest became.

Then she saw it.

Not a firefly.

A wildfire.

The closer she stepped, the heavier the smoke became. It filled her lungs and stole her breath. Her face turned pale, her eyes burned with tears.

Yet hidden beside the raging flames stood a small bonfire.

Its warmth was gentle.

Enough to comfort her.

Not enough to consume her.

Above, the moon shone brighter than ever, though smoke and clouds veiled its light, much like grief veils the heart.

She stood between two fires.

One that could warm her.

One that could destroy her.

She did not know which she truly needed.

Something to quench her thirst.

Or something that would leave her completely dry.

Lost between her thoughts, she slowly lost herself.

That hollow feeling returned.

It weakened her heart until it became quiet.

One choice would decide her sky.

Time moved too quickly as she wavered between paths.

That terrible feeling, when the heart wants one thing,
Yet the soul knows it cannot survive it.

Her heart was adorned with needles now.

Wrapped in thorns.

The air became harder to breathe.

And there was no turning back.

The path behind her had closed.

The sky had darkened.

The fire only burned brighter, believing she would choose it.

Little did it know,
It had hurt her every single time.

She fell to her knees and prayed for rain.

The girl who once longed for warmth now begged for coldness.

For emptiness.

For relief.

She stared at her burned hands.

At her scarred skin.

And whispered;

Perhaps I should never have come here.

Perhaps I was never meant to feel warmth.

Perhaps I do not deserve it.

Perhaps this is simply too much.

The bonfire dimmed as it witnessed her tears.

The wildfire did not.

"Why aren't you choosing me?" it asked.

"You are too much for me," she replied.

And turned away.

Only then did the wildfire truly see her scars.

See what its flames had done.

See how much she had suffered.

"Sorry-"

But before the apology could reach her, she collapsed.

The fire lost control.

It rushed toward her from every direction, surrounding her completely.

And it burned her alive.

Thus ended a noble soul.

A soul who only wished to become someone worth looking up to.

A soul who searched endlessly for the warmth she had always lacked.

Perhaps, in another life, the fire would not consume her.

Perhaps it would heal her frostbitten hands.

Guide her through her darkest nights.

And teach her that warmth was never meant to hurt.

Leaving the final page blank, just in case.....`
  },
  {
    entry: 2,
    title: "WHISPERS OF THE EARTH",
    genre: "Dream Poetry",
    cover: "assets/optimized/Whispers_of_Earth.webp",
    excerpt: "The first time the wind whispered my name, I thought it was lying. Beneath the moss, under an ancient oak, I found a library made of soil.",
    verses: `The first time the wind whispered my name, I thought it was lying.

No one speaks to girls like me.

Not anymore.

Not in a world where rivers are bought and bottled, and the sky is just a faded ceiling no one looks at.

But the truth is: I was born remembering.

The trees still whispered to me. And they had not forgotten what the world chose to erase.

But that morning on the fourth day of Ember Season I felt it.

The earth shivered under my bare feet.

And I heard it again.

Lyra.

The voice came from the roots.

I live in a place they call the Hollow. It's the last patch of land they haven't burned or built over.

They left it alone because it scared them. Because here, the air still remembers.

They say the world died years ago. That climate change swallowed the oceans, cracked the soil, and ruined every chance we had.

But that's not true.

The world didn't die.

It simply stopped talking to us.

Until now.

I don't know why the Hollow chose me.

Maybe because I listen.

Maybe because when I close my eyes, I can feel the ghosts of extinct birds nesting in my ribcage.

My grandmother once told me, "When the trees remember your name, child, it means you're part of their last story."

So I waited.

And the Hollow showed me what they buried.

Beneath the moss, under the cracked bark of an ancient oak, I found it:

A library made of soil.

Each leaf held a memory.

Each root, a name.

The oceans, once blue, cried through the stones.

There were no heroes here. No shining machines.

Just a girl with scars on her palms and questions on her tongue.

I asked the wind why the world turned away from us.

And it said:

"Because you traded your skies for smoke. Your rivers for noise. Your truth for progress."

And then it asked me something I didn't expect.

It asked me to give up my voice.

To offer the one thing I still had — belief.

Belief that this Earth still wants us. Still aches for us. Still waits.

I knelt down.

I pressed my hand to the roots.

And I whispered:

"I remember you."

The trees wept.

The sky cracked open.

And for the first time in centuries, the soil sighed in relief.

I didn't save the world.

I simply reminded it of who we used to be.`
  },
  {
    entry: 3,
    title: "MELLOW GLOW FROM WITHIN",
    genre: "Cosmic / Self-light Poetry",
    cover: "assets/optimized/She_Became_In_Silence.webp",
    excerpt: "The stars did not guide her. They simply watched as she learned to glow on her own — becoming her own sun, her own galaxy.",
    verses: `The stars did not guide her.

They simply watched as she learned to glow on her own.

The stars within her guided her.

They did not speak, nor did they interfere.

They simply watched quietly as she learned to glow on her own.

Most stars do not carry their own light.

They reflect what is given to them, borrowing brilliance from something greater.

But when everything around her turned dark, she chose differently.

She did not search for light to reflect.

She did not wait for the sun.

Instead, she created her own.

A glow that did not depend on anything, a light that did not fade with the absence of others.

It was softer at first, almost fragile — but it grew, day by day, stronger than anything she had ever known.

Even the stars seemed to pause, watching her in quiet awe, wondering how she continued to shine without borrowing anyone's fire.

She became her own sun.

Her own galaxy.

And with that quiet, unwavering glow, she walked forward toward her destiny.`
  },
  {
    entry: 4,
    title: "SCARS THAT SHINE",
    genre: "Cosmic Poetry",
    cover: "assets/optimized/Eighteen.webp",
    excerpt: "The moon hung low with quiet secrets that only she could hear. She saw herself in the moon — and found comfort in its scars.",
    verses: `The moon hung low with quiet secrets
that only she could hear.

There is an ease in the sky — a scarred star that still shines.

The sun burns bright, but the moon hums with secrets, soft and unspoken, meant only for those who truly observe.

It is not loud.

It does not call for attention.

Only she could hear it — not with her ears, but with something deeper.

The moon appears when the world slows down, becoming a quiet companion to those who seek silence rather than sound.

It shines with the stars, reminding us that even something distant, something scarred, can still glow with grace.

She saw herself in the moon.

Sometimes clearly, sometimes not at all.

But she always found comfort in its scars. The moon never spoke aloud, yet she heard it with her heart.`
  },
  {
    entry: 5,
    title: "A LOVE THAT WAS NEVER HEARD",
    genre: "Emotional / Unrequited Poetry",
    cover: "assets/optimized/Library_of_Stars.webp",
    excerpt: "She remained a distant star, unseen, unspoken — loving him from a universe he would never look back at.",
    verses: `She kept looking at the silent space, hoping it would speak her name.

She laughed with the world, but when he appeared, her voice faded into quiet.

As if her existence softened in his presence.

She heard his heart belonged elsewhere.

And something within her dimmed — like a star losing its light.

He never knew there was a girl who quietly shaped herself around his existence, willing to change even the smallest parts of her world just to feel closer to him.

She built galaxies in her mind, filled with moments that only existed in her imagination.

Somewhere, the one he loved would live those moments, without ever knowing they once belonged to her dreams.

He never knew there was a girl who quietly shaped herself around his existence, willing to change even the smallest parts of her world just to feel closer to him.

Even the things she feared, even the things that unsettled her — she would have faced them, if it meant standing beside him.

Somewhere along the way, her feelings had started to depend on him for meaning.

And so, she remained a distant star, unseen, unspoken, loving him from a universe he would never look back at.`
  }
];

function titleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function renderPoetryBookshelf() {
  const shelf = document.getElementById('poetry-bookshelf');
  if (!shelf) return;

  shelf.innerHTML = poems.map((poem, index) => `
    <article class="poem-book-card" data-poem-index="${index}">
      <button type="button" class="poem-book-trigger po-btn-read" data-poem-index="${index}" aria-label="Open ${titleCase(poem.title)}">
        <div class="poem-book">
          <div class="poem-book-spine" aria-hidden="true"></div>
          <div class="poem-book-pages-edge" aria-hidden="true"></div>
          <div class="poem-book-cover">
            <img src="${poem.cover}" alt="${poem.title} cover" width="200" height="280" loading="lazy" decoding="async">
            <div class="poem-book-shine" aria-hidden="true"></div>
          </div>
        </div>
      </button>
      <div class="poem-book-info">
        <span class="poem-entry-num">Entry ${String(poem.entry).padStart(2, '0')}</span>
        <h3>${titleCase(poem.title)}</h3>
        <span class="poem-book-genre">${poem.genre}</span>
        <p class="poem-book-excerpt">${poem.excerpt}</p>
        <button type="button" class="btn-secondary po-btn-read" data-poem-index="${index}">Open Book</button>
      </div>
    </article>
  `).join('');
}

(function initPoetryReadView() {
  renderPoetryBookshelf();

  const readView   = document.getElementById('po-read-view');
  if (!readView) return;

  const coverImg   = document.getElementById('po-read-cover-img');
  const entryEl    = document.getElementById('po-read-entry');
  const genreEl    = document.getElementById('po-read-genre');
  const titleEl    = document.getElementById('po-read-title');
  const bodyEl     = document.getElementById('po-read-body');
  const ttsBtn     = document.getElementById('btn-po-tts');
  const ttsLabel   = document.getElementById('btn-po-tts-label');
  const closeBtn   = document.getElementById('btn-po-close');
  const closeBtn2  = document.getElementById('btn-po-close2');
  const prevBtn    = document.getElementById('btn-po-prev');
  const nextBtn    = document.getElementById('btn-po-next');
  const scrollEl   = readView.querySelector('.po-read-scroll');

  let currentIndex = 0;
  let isSpeaking   = false;
  let utterance    = null;

  function formatVerses(text) {
    const first = text.charAt(0);
    const rest  = text.slice(1);
    return `<span class="po-read-dropcap">${first}</span>${rest}`;
  }

  function openPoem(index) {
    const poem = poems[index];
    if (!poem) return;
    currentIndex = index;

    coverImg.src = poem.cover;
    coverImg.alt = `${poem.title} cover`;
    entryEl.textContent = `Entry ${String(poem.entry).padStart(2, '0')}`;
    genreEl.textContent = poem.genre;
    titleEl.textContent = titleCase(poem.title);
    bodyEl.innerHTML = formatVerses(poem.verses);

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === poems.length - 1;

    if (scrollEl) scrollEl.scrollTop = 0;
    stopTTS();

    readView.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    ttsBtn.onclick = () => toggleTTS(index);
  }

  function closePoem() {
    stopTTS();
    readView.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function stopTTS() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    isSpeaking = false;
    if (ttsBtn)   ttsBtn.classList.remove('speaking');
    if (ttsLabel) ttsLabel.textContent = 'Listen';
  }

  function toggleTTS(index) {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      stopTTS();
    } else {
      isSpeaking = true;
      ttsBtn.classList.add('speaking');
      ttsLabel.textContent = 'Stop';
      utterance = new SpeechSynthesisUtterance(poems[index].verses);
      utterance.onend = stopTTS;
      window.speechSynthesis.speak(utterance);
    }
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.po-btn-read');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt(btn.getAttribute('data-poem-index'), 10);
    openPoem(isNaN(idx) ? 0 : idx);
  });

  closeBtn.addEventListener('click', closePoem);
  closeBtn2.addEventListener('click', closePoem);

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) openPoem(currentIndex - 1);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentIndex < poems.length - 1) openPoem(currentIndex + 1);
  });

  document.addEventListener('keydown', e => {
    if (readView.classList.contains('hidden')) return;
    if (e.key === 'Escape') closePoem();
    if (e.key === 'ArrowLeft' && currentIndex > 0) openPoem(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < poems.length - 1) openPoem(currentIndex + 1);
  });
})();
