document.addEventListener('DOMContentLoaded', () => {

    // ===== LOADER =====
    const loaderOverlay = document.querySelector('.loader-overlay');
    if (loaderOverlay) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loaderOverlay.style.opacity = '0';
                setTimeout(() => {
                    loaderOverlay.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }

    // ===== THEME TOGGLE =====
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });

        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
        }
    }

    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('header');
    if(header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ===== TYPING EFFECT =====
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const phrases = ["comme un pro.", "sans stress.", "avec discrétion.", "avant les pirates."];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentPhrase = phrases[phraseIndex];
            const typeSpeed = isDeleting ? 50 : 100;

            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                setTimeout(() => isDeleting = true, 1200);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
            setTimeout(type, typeSpeed);
        }
        setTimeout(type, 1500);
    }

    // ===== SCROLL ANIMATIONS (INTERSECTION OBSERVER) =====
    const animatedElements = document.querySelectorAll('.service-item, .step, .faq-item, .method, .contact-form, .disclaimer, .footer-grid > div');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('hidden');
            } 
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => {
        el.classList.add('hidden');
        observer.observe(el);
    });

    // ===== ACTIVE NAV LINK ON SCROLL =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');

    if(sections.length && navLinks.length) {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ===== ESTIMATOR MODAL LOGIC =====
    const modal = document.getElementById('estimator-modal');
    const openBtn = document.getElementById('open-estimator-btn');
    const closeBtn = document.getElementById('close-estimator-btn');
    const estimatorForm = document.getElementById('estimator-form');
    
    if (modal && openBtn && closeBtn && estimatorForm) {
        const formSteps = modal.querySelectorAll('.form-step');
        const nextBtns = modal.querySelectorAll('.next-btn');
        const prevBtns = modal.querySelectorAll('.prev-btn');
        const progressSteps = modal.querySelectorAll('.progress-step');
        let currentStep = 0;

        const showModal = () => modal.classList.add('visible');
        const hideModal = () => modal.classList.remove('visible');

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });

        closeBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep < formSteps.length - 1) {
                    if (currentStep === 0) { // After service selection
                        const serviceType = estimatorForm.querySelector('input[name="service_type"]:checked').value;
                        modal.querySelectorAll('.service-questions').forEach(div => div.style.display = 'none');
                        modal.querySelector(`.service-questions[data-service="${serviceType}"]`).style.display = 'block';
                    }
                    if (currentStep === 1) { // After details
                        calculateEstimation();
                    }
                    currentStep++;
                    updateFormSteps();
                }
            });
        });

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    updateFormSteps();
                }
            });
        });

        modal.querySelectorAll('button[type="submit"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const sendMethod = e.target.dataset.sendMethod;
                
                const formData = new FormData(estimatorForm);
                const serviceType = formData.get('service_type');
                const contactInfo = formData.get('contact_info');
                const message = formData.get('contact_message') || 'Aucun';
                const priceRange = document.getElementById('price-range').textContent;

                let details = '';
                if (serviceType === 'audit') {
                    details = `Type d\'actif: ${formData.get('audit_asset_type')}\nComplexité: ${formData.get('audit_complexity')}`;
                } else if (serviceType === 'securisation') {
                    details = `Technologie: ${formData.get('securisation_tech')}`;
                } else if (serviceType === 'recuperation') {
                    details = `Type de compte: ${formData.get('recuperation_account')}`;
                }

                const subject = `Demande de Devis pour: ${serviceType}`;
                const body = `Bonjour,\n\nJ\'aimerais demander un devis pour le service suivant :\n\n--- DÉTAILS DE LA DEMANDE ---\nService : ${serviceType}\n${details}\n\nEstimation de prix : ${priceRange}\n\n--- INFORMATION DE CONTACT ---\nContact : ${contactInfo}\n\n--- MESSAGE SUPPLÉMENTAIRE ---\n${message}\n\nCordialement.\n`;

                if (sendMethod === 'email') {
                    const mailtoUrl = `mailto:cybersecpro18@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailtoUrl;
                } else if (sendMethod === 'telegram') {
                    const telegramUrl = `https://t.me/CyberSecPro18?text=${encodeURIComponent(body)}`; // Telegram doesn't support subject
                    window.open(telegramUrl, '_blank');
                }
                
                hideModal();
                setTimeout(() => {
                    estimatorForm.reset();
                    currentStep = 0;
                    updateFormSteps();
                }, 300);
            });
        });

        function updateFormSteps() {
            formSteps.forEach((step, index) => {
                step.classList.toggle('active', index === currentStep);
            });
            progressSteps.forEach((step, index) => {
                step.classList.toggle('active', index <= currentStep);
            });
        }

        function calculateEstimation() {
            const serviceType = estimatorForm.querySelector('input[name="service_type"]:checked').value;
            let basePrice = 0;
            let multiplier = 1;

            if (serviceType === 'audit') {
                basePrice = 150;
                const complexity = estimatorForm.querySelector('input[name="audit_complexity"]:checked').value;
                if (complexity === 'medium') multiplier = 2.5;
                if (complexity === 'high') multiplier = 5;
            } else if (serviceType === 'securisation') {
                basePrice = 200;
                const tech = estimatorForm.querySelector('input[name="securisation_tech"]:checked').value;
                if (tech === 'prestashop') multiplier = 1.5;
                if (tech === 'custom') multiplier = 2;
            } else if (serviceType === 'recuperation') {
                basePrice = 100;
                const account = estimatorForm.querySelector('input[name="recuperation_account"]:checked').value;
                if (account === 'email') multiplier = 1.5;
            }

            const minPrice = basePrice * (multiplier * 0.8);
            const maxPrice = basePrice * (multiplier * 1.2);

            document.getElementById('price-range').textContent = `${Math.round(minPrice)}€ - ${Math.round(maxPrice)}€`;
        }

        window.contactService = function(serviceName) {
            const serviceValue = serviceName.toLowerCase().split(' ')[0];
            const radio = modal.querySelector(`input[name="service_type"][value="${serviceValue}"]`);
            if(radio) {
                radio.checked = true;
            }
            showModal();
        }
    }
});

// ===== GLOBAL FUNCTIONS (like FAQ toggle) =====
function toggleFaq(element) {
    const faqItem = element.parentElement;
    if (faqItem) {
        faqItem.classList.toggle('active');
    }
}