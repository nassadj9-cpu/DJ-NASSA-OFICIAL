import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "GOOGLE_API_KEY",
    authDomain: "dj-nassa.firebaseapp.com",
    projectId: "dj-nassa",
    storageBucket: "dj-nassa.firebasestorage.app",
    messagingSenderId: "74937447758",
    appId: "1:74937447758:web:52ca0e15280920962e5a1f",
    measurementId: "G-TQBSY2S126"
};

let app;
let analytics;
let db;

try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
        throw new Error("Firebase API key is missing. Please configure GOOGLE_API_KEY environment variable.");
    }
    
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    
    console.log('Firebase initialized successfully');
    
    logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
} catch (error) {
    console.error('Error initializing Firebase:', error);
    console.error('Firebase functionality will be limited. Please check your configuration.');
}

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (analytics) {
                logEvent(analytics, 'menu_interaction', {
                    action: 'toggle_mobile_menu'
                });
            }
        });
    }

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            navMenu.classList.remove('active');
            if (analytics) {
                logEvent(analytics, 'navigation_click', {
                    link_text: e.target.textContent,
                    link_url: e.target.href
                });
            }
        });
    });

    createParticles();

    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const galleryItems = document.querySelectorAll('.gallery-item');
                
                galleryItems.forEach(item => {
                    if (filter === 'all' || item.getAttribute('data-category') === filter) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                if (analytics) {
                    logEvent(analytics, 'gallery_filter', {
                        filter_type: filter
                    });
                }
            });
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formMessage = document.getElementById('formMessage');
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                eventType: document.getElementById('eventType').value,
                eventDate: document.getElementById('eventDate').value,
                location: document.getElementById('location').value,
                guests: document.getElementById('guests').value,
                message: document.getElementById('message').value,
                timestamp: serverTimestamp(),
                status: 'new'
            };
            
            try {
                if (!db) {
                    throw new Error('Firebase is not initialized. Your booking request cannot be submitted at this time.');
                }
                
                const docRef = await addDoc(collection(db, 'bookings'), formData);
                console.log('Booking submitted with ID:', docRef.id);
                
                if (analytics) {
                    logEvent(analytics, 'booking_request_submitted', {
                        event_type: formData.eventType,
                        location: formData.location
                    });
                }
                
                formMessage.className = 'form-message success';
                formMessage.textContent = '¡Thank you! Your booking request has been received. We\'ll contact you soon!';
                
                contactForm.reset();
            } catch (error) {
                console.error('Error submitting booking:', error);
                
                formMessage.className = 'form-message error';
                formMessage.textContent = 'There was an error submitting your request. Please try again or contact us directly at booking@djnassa.com';
                
                if (analytics) {
                    logEvent(analytics, 'booking_request_error', {
                        error_message: error.message
                    });
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 8000);
            }
        });
    }

    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            const icon = playBtn.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                if (analytics) {
                    logEvent(analytics, 'music_player_interaction', {
                        action: 'play'
                    });
                }
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                if (analytics) {
                    logEvent(analytics, 'music_player_interaction', {
                        action: 'pause'
                    });
                }
            }
        });
    }

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
            if (analytics) {
                logEvent(analytics, 'scroll_interaction', {
                    action: 'scroll_down_click'
                });
            }
        });
    }

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (analytics) {
                logEvent(analytics, 'cta_button_click', {
                    button_text: e.currentTarget.textContent.trim(),
                    button_href: e.currentTarget.href || 'no-link'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.event-card, .style-card, .testimonial-card, .gallery-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});

function createParticles() {
    const particlesContainers = document.querySelectorAll('.particles');
    
    particlesContainers.forEach(container => {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 3 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.5})`;
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 10 + 5}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            
            container.appendChild(particle);
        }
    });
}

const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translate(0, 0);
            opacity: 0;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
        }
    }
`;
document.head.appendChild(style);

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    }
});
