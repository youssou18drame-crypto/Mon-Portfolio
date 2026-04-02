/**
 * Portfolio - El hadji Youssou Drame
 * Script principal utilisant les bonnes pratiques ES6+
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Gestion de la Navigation Active ---
    // On récupère tous les liens de navigation
    const navLinks = document.querySelectorAll("#main-nav a");
    const currentUrl = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        // Si le href du lien correspond à la page actuelle, on ajoute la classe 'active'
        if (link.getAttribute("href") === currentUrl || (currentUrl === "" && link.getAttribute("href") === "index.html")) {
            link.classList.add("active");
        }

        // Effet de feedback au clic dans la console (Utile pour le debug)
        link.addEventListener("click", () => {
            console.log(`Navigation vers la section : ${link.textContent.trim()}`);
        });
    });

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