// --- 0. Preloader Logic ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }, 2000); // 2 saniye bekleme
});

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            // Change color if not scrolled because it opens over light background
            if(window.scrollY < 50) {
              icon.style.color = 'var(--color-brown-dark)';
            }
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            if(window.scrollY < 50) {
              icon.style.color = 'var(--color-white)';
            }
        }
    });
    
    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            if(window.scrollY < 50) {
                icon.style.color = 'var(--color-white)';
            }
        });
    });

    // --- 3. Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% is visible
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
    
    // --- 4. Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerOffset = 80; // Approximate navbar height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- 5. Lightbox Modal Logic ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

    if (lightbox && lightboxTriggers.length > 0) {
        lightboxTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation(); // Parent card hover logic control
                const imageSrc = trigger.getAttribute('data-image');
                const caption = trigger.getAttribute('data-caption');

                lightboxImg.src = imageSrc;
                lightboxCaption.textContent = caption;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            // Clear src after fade out to avoid ghosting next time
            setTimeout(() => {
                if (!lightbox.classList.contains('active')) {
                    lightboxImg.src = '';
                }
            }, 400);
        };

        lightboxClose.addEventListener('click', closeLightbox);
        
        // Close on click outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // --- 6. Bespoke Form Logic ---
    const bespokeForm = document.getElementById('bespoke-form');
    if (bespokeForm) {
        bespokeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('order-name').value;
            const phone = document.getElementById('order-phone').value;
            const category = document.getElementById('order-category').value;
            const color = document.getElementById('order-color').value || 'Belirtilmedi';
            const size = document.getElementById('order-size').value || 'Belirtilmedi';
            const date = document.getElementById('order-date').value || 'Belirtilmedi';
            const notes = document.getElementById('order-notes').value || 'Yok';

            let message = `*Yeni Özel Sipariş Talebi*%0A%0A`;
            message += `*👤 İsim:* ${name}%0A`;
            message += `*📞 Telefon:* ${phone}%0A`;
            message += `*🧶 Ürün:* ${category}%0A`;
            message += `*🎨 Renk:* ${color}%0A`;
            message += `*📏 Ölçü:* ${size}%0A`;
            message += `*🗓️ Tarih:* ${date}%0A`;
            message += `%0A*📝 Notlar:* ${notes}`;

            const whatsappUrl = `https://wa.me/905330513394?text=${message}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // --- 7. Soundscape Logic ---
    const soundToggle = document.getElementById('sound-toggle');
    const bgAmbience = new Audio('https://upload.wikimedia.org/wikipedia/commons/b/b0/Bird_Song_Ambience.mp3');
    bgAmbience.loop = true;
    bgAmbience.volume = 0.5;

    let isPlaying = false;

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            console.log("Sound toggle clicked, isPlaying:", isPlaying);
            if (isPlaying) {
                bgAmbience.pause();
                console.log("Ambience paused");
                soundToggle.classList.remove('playing');
                soundToggle.querySelector('i').className = 'fas fa-volume-mute';
            } else {
                bgAmbience.play()
                    .then(() => {
                        console.log("Ambience playing successfully");
                        soundToggle.classList.add('playing');
                        soundToggle.querySelector('i').className = 'fas fa-volume-up';
                    })
                    .catch(e => {
                        console.error("Ambience Error:", e);
                        alert("Ses dosyası yüklenemedi, bağlantı sorunu olabilir.");
                    });
            }
            isPlaying = !isPlaying;
        });
    }
});
