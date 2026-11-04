/**
 * Portfolio - El hadji Youssou Drame
 * Script principal utilisant les bonnes pratiques ES6+
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Gestion de la Navigation Active ---
    // Le lien bleu suit automatiquement la section visible pendant le défilement.
    const navLinks = document.querySelectorAll("#main-nav a");
    const sections = [...navLinks]
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const updateActiveNav = () => {
        const position = window.scrollY + Math.min(window.innerHeight * 0.35, 260);
        let currentSection = sections[0];

        sections.forEach(section => {
            if (section.offsetTop <= position) {
                currentSection = section;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                currentSection && link.getAttribute("href") === `#${currentSection.id}`
            );
        });
    };

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
        });
    });

    updateActiveNav();
    window.addEventListener("scroll", updateActiveNav, { passive: true });
    window.addEventListener("resize", updateActiveNav);

    // --- 2. Animation au survol des cartes (Compétences & À Propos) ---
    // Utilisation de querySelectorAll pour cibler plusieurs éléments d'un coup
    const cards = document.querySelectorAll(".skill-card, .about-card, .timeline-content");

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.borderColor = "var(--primary-color)";
            card.style.transition = "all 0.3s ease";
        });

        card.addEventListener("mouseleave", () => {
            card.style.borderColor = "transparent";
        });
    });

    // --- 3. Effet d'apparition au défilement (Scroll Reveal) ---
    // Une bonne pratique pour rendre le site vivant
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    // On applique l'effet aux titres et aux éléments de la timeline
    const fadeElements = document.querySelectorAll(".section-title, .timeline-item, .hero-content");
    
    fadeElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.6s ease-out";
        observer.observe(el);
    });

    // --- 4. Message de bienvenue dynamique ---
    const hour = new Date().getHours();
    const greetingElement = document.querySelector(".greeting");
    
    if (greetingElement) {
        if (hour >= 18) {
            greetingElement.textContent = "Bonsoir, je suis";
        } else {
            greetingElement.textContent = "Bonjour, je suis";
        }
    }

    console.log("Portfolio chargé avec succès !");
});

/* Afficher WhatsApp uniquement lorsque la section Contact est visible */
document.addEventListener('DOMContentLoaded', () => {
    const contactSection = document.getElementById('contact');
    const whatsappButton = document.querySelector('.whatsapp-float');
    if (!contactSection || !whatsappButton) return;

    const updateWhatsAppVisibility = () => {
        const rect = contactSection.getBoundingClientRect();
        const visible = rect.top < window.innerHeight && rect.bottom > 0;
        whatsappButton.classList.toggle('whatsapp-visible', visible);
    };

    updateWhatsAppVisibility();
    window.addEventListener('scroll', updateWhatsAppVisibility, { passive: true });
    window.addEventListener('resize', updateWhatsAppVisibility);
});


/* PWA : enregistrement du service worker pour l'accès hors ligne */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.error("Service Worker :", error));
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("veille-rss-grid");
  const status = document.getElementById("veille-rss-status");
  if (!grid || !status) return;
  try {
    const response = await fetch("./data/veille-rss.json", {cache: "no-store"});
    if (!response.ok) throw new Error("RSS not ready");
    const data = await response.json();
    if (!Array.isArray(data.articles) || !data.articles.length) throw new Error("Empty RSS");
    const dateText = value => value && !Number.isNaN(Date.parse(value))
      ? new Date(value).toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"})
      : "Date inconnue";
    const topics = [{id:"ia",title:"Intelligence artificielle et développement web"},{id:"cybersecurite",title:"Cybersécurité des applications web"}];
    const fallback = {
      ia: {
        title: "GitHub Copilot est désormais disponible dans JetBrains Air",
        summary: "GitHub annonce l'intégration de Copilot dans JetBrains Air pour déléguer des tâches de développement, guider leur exécution et examiner les résultats.",
        url: "https://github.blog/changelog/2026-11-03-github-copilot-is-now-available-in-jetbrains-air",
        source: "GitHub Changelog",
        date: "2026-11-03T15:11:46+00:00"
      },
      cybersecurite: {
        title: "Vulnérabilité dans Keycloak : contournement de la politique de sécurité",
        summary: "Le CERT-FR signale une vulnérabilité de Keycloak touchant certaines versions antérieures à 26.7.4. Un exemple concret de la nécessité de sécuriser l'authentification des applications.",
        url: "https://www.cert.ssi.gouv.fr/avis/CERTFR-2026-AVI-1195/",
        source: "CERT-FR / ANSSI",
        date: "2026-09-17T00:00:00+02:00"
      }
    };
    const selected = topics.map(topic => ({...topic, article:data.articles.find(article => article.topic === topic.id) || fallback[topic.id]}));
    selected.forEach(topic => {
      const article = topic.article;
      const section = document.createElement("section");
      const heading = document.createElement("h3");
      heading.textContent = topic.title;
      section.appendChild(heading);
      if (!article) {
        const waiting = document.createElement("p");
        waiting.textContent = "Article RSS en attente pour ce sujet.";
        section.appendChild(waiting);
        grid.appendChild(section);
        return;
      }
      if (typeof article.url !== "string" || !article.url.startsWith("https://")) return;
      const card = document.createElement("article");
      card.className = "veille-card";
      const date = document.createElement("div");
      date.className = "veille-date";
      date.textContent = dateText(article.date) + " · " + (article.source || "RSS");
      const title = document.createElement("h3");
      title.textContent = article.title || "Actualité";
      const summary = document.createElement("p");
      summary.textContent = article.summary || "Consulter la publication.";
      const link = document.createElement("a");
      link.className = "veille-link";
      link.href = article.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Lire l'article ↗";
      card.append(date, title, summary, link);
      section.appendChild(card);
      grid.appendChild(section);
    });
    status.textContent = "Flux RSS/Atom · Dernière récupération : " + dateText(data.updated_at);
  } catch (error) {
    status.textContent = "Actualités francophones en attente de la prochaine récupération RSS.";
    console.warn("Veille RSS :", error);
  }
});
