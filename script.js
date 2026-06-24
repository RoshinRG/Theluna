(!(function () {
  const e = document.getElementById("loading-bar"),
    t = document.getElementById("loading-screen");
  let n = 0;
  const o = setInterval(() => {
    (n < 80
      ? (n += 8 * Math.random() + 2)
      : n < 95 && (n += 0.5 * Math.random()),
      (n = Math.min(n, 95)),
      e && (e.style.width = n + "%"));
  }, 150);
  window.addEventListener("load", () => {
    (clearInterval(o),
      e && (e.style.width = "100%"),
      setTimeout(() => {
        (t && t.classList.add("hidden"),
          setTimeout(() => {
            t && t.remove();
            
            // Defer heavy Three.js background initialization to avoid performance penalty
            const loadThreeJS = () => import('./three/main.js').catch(console.error);
            if (window.requestIdleCallback) {
              requestIdleCallback(loadThreeJS);
            } else {
              setTimeout(loadThreeJS, 1000);
            }
          }, 900));
      }, 400));
  });
})(),
  document.addEventListener("DOMContentLoaded", () => {
    const e = document.documentElement;
    document.addEventListener("mousemove", (t) => {
      (e.style.setProperty("--cursor-x", `${t.clientX}px`),
        e.style.setProperty("--cursor-y", `${t.clientY}px`));
    });
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
    });
    const o = document.querySelectorAll(".spa-section");
    function s() {
      const e = window.location.hash.substring(1) || "home";
      o.forEach((e) => {
        e.classList.remove("spa-visible");
      });
      const s = document.getElementById(e);
      if (s) {
        s.classList.add("spa-visible");
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
          const o = e.getBoundingClientRect(),
            s = t.getBoundingClientRect(),
            a = o.left - s.left,
            i = o.width;
          (n.forEach((e) => e.classList.remove("active")),
            e.classList.add("active"));
          (t.style.setProperty("--ambience-x", `${a}px`),
            t.style.setProperty("--ambience-width", `${i}px`));
        })(a),
        window.scrollTo(0, 0));
    }
    (window.addEventListener("hashchange", s), setTimeout(s, 100));
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
        n && ((n.style.display = "flex"), (u.scrollTop = u.scrollHeight));
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
            if ((clearTimeout(t), !n.ok)) {
              if (429 === n.status) throw new Error("RateLimit");
              throw new Error("API response was not ok");
            }
            let o = (await n.json()).choices[0].message.content;
            return (
              (o = o.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()),
              (o = o.replace(/<think>[\s\S]*/gi, "").trim()),
              p.push({ role: "assistant", content: o }),
              o
            );
          } catch (e) {
            return (
              console.error("ASTRA API Error:", e),
              p.pop(),
              "AbortError" === e.name
                ? "The stars are taking too long to align... The connection timed out. Please try again."
                : "RateLimit" === e.message
                  ? "I'm feeling a little overwhelmed by the cosmic energy! Please wait a moment before asking again."
                  : "The cosmic connection is weak right now... I'm having trouble thinking. Please try again later!"
            );
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

          const formData = new FormData();
          formData.append("email", email);
          formData.append("message", message);

          await fetch(googleScriptUrl, {
            method: "POST",
            body: formData,
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
            o = e.querySelector(".meta"),
            s = e.querySelector(".description"),
            a = e.querySelector(".card-action a");
          (t
            ? ((L.src = t.src),
              (L.alt = t.alt),
              (L.parentElement.style.display = "flex"))
            : (L.parentElement.style.display = "none"),
            (x.textContent = n ? n.textContent : ""),
            (I.innerHTML = o ? o.innerHTML : ""),
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
  }));
