// --- 0. Splash Screen / Preloader Logic ---
const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        document.body.classList.remove('no-scroll');
    }
};

const enterBtn = document.getElementById('enter-site-btn');
const audioApplause = document.getElementById('audio-applause');
const audioMusic = document.getElementById('audio-music');
const muteBtn = document.getElementById('mute-btn');

// Helper function for confetti bursts
const triggerConfetti = (durationMs, particleCount = 5) => {
    if (typeof confetti !== 'function') return;
    var duration = durationMs;
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: particleCount,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffc0cb', '#ff69b4', '#ffffff', '#ffd700']
        });
        confetti({
            particleCount: particleCount,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffc0cb', '#ff69b4', '#ffffff', '#ffd700']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};

if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        // Show mute button
        if (muteBtn) {
            muteBtn.style.display = 'flex';
        }
        // Play Audio
        if (audioApplause) audioApplause.play().catch(e => console.log('Audio play failed:', e));
        if (audioMusic) {
            audioMusic.volume = 0.5;
            audioMusic.play().catch(e => console.log('Audio play failed:', e));
        }

        // Fire big Confetti burst
        triggerConfetti(3000, 5);

        // Hide screen after a tiny delay to allow confetti to start
        setTimeout(hidePreloader, 400);

        // Set interval for occasional subtle confetti bursts while browsing (every 20 seconds)
        setInterval(() => {
            triggerConfetti(1000, 2); // Shorter, fewer particles
        }, 20000);
    });
}

// --- Mute Button Logic ---
if (muteBtn) {
    muteBtn.addEventListener('click', () => {
        if (audioMusic) {
            audioMusic.muted = !audioMusic.muted;
            const icon = muteBtn.querySelector('i');
            if (audioMusic.muted) {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
            } else {
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
            }
        }
    });
}

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
            const color = document.getElementById('order-color').value;
            const size = document.getElementById('order-size').value;
            const date = document.getElementById('order-date').value;
            const notes = document.getElementById('order-notes').value;

            const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'tr') === 'en';
            
            const categoryEn = {
                'Supla Seti': 'Charger Set',
                'Runner': 'Table Runner',
                'El Örgüsü Çanta': 'Handmade Bag',
                'Diğer': 'Other'
            };

            const translatedCategory = isEn ? (categoryEn[category] || category) : category;
            const translatedColor = color ? color : (isEn ? 'Not Specified' : 'Belirtilmedi');
            const translatedSize = size ? size : (isEn ? 'Not Specified' : 'Belirtilmedi');
            const translatedDate = date ? date : (isEn ? 'Not Specified' : 'Belirtilmedi');
            const translatedNotes = notes ? notes : (isEn ? 'None' : 'Yok');

            let message = '';
            if (isEn) {
                message = `*New Bespoke Order Request*\n\n`;
                message += `👤 *Name:* ${name}\n`;
                message += `📞 *Phone:* ${phone}\n`;
                message += `🧶 *Product:* ${translatedCategory}\n`;
                message += `🎨 *Color:* ${translatedColor}\n`;
                message += `📏 *Size:* ${translatedSize}\n`;
                message += `🗓️ *Date:* ${translatedDate}\n\n`;
                message += `📝 *Notes:* ${translatedNotes}`;
            } else {
                message = `*Yeni Özel Sipariş Talebi*\n\n`;
                message += `👤 *İsim:* ${name}\n`;
                message += `📞 *Telefon:* ${phone}\n`;
                message += `🧶 *Ürün:* ${translatedCategory}\n`;
                message += `🎨 *Renk:* ${translatedColor}\n`;
                message += `📏 *Ölçü:* ${translatedSize}\n`;
                message += `🗓️ *Tarih:* ${translatedDate}\n\n`;
                message += `📝 *Notlar:* ${translatedNotes}`;
            }

            const whatsappUrl = `https://wa.me/905330513394?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // --- 7. Instagram Interactive Integration (Stories Highlights & Lightbox Modal) ---
    
    // Stories highlights data
    const STORIES_DATA = {
        atolye: {
            title: "Atölyemiz",
            slides: [
                { type: "image", url: "assets/product-1.jpg", time: "2sa" },
                { type: "image", url: "assets/product-2.jpg", time: "1sa" },
                { type: "image", url: "assets/product-8.jpg", time: "45dk" }
            ]
        },
        paketleme: {
            title: "Özenli Paketleme",
            slides: [
                { type: "image", url: "assets/product-3.jpg", time: "5g" },
                { type: "image", url: "assets/product-4.jpg", time: "4g" }
            ]
        },
        "sizden-gelenler": {
            title: "Sizden Gelenler",
            slides: [
                { type: "image", url: "assets/product-5.jpg", time: "1h" },
                { type: "image", url: "assets/product-6.jpg", time: "6g" }
            ]
        },
        bakim: {
            title: "Bakım Kılavuzu",
            slides: [
                { type: "image", url: "assets/product-runner.jpg", time: "3h" },
                { type: "image", url: "assets/product-gray.jpg", time: "2h" }
            ]
        }
    };

    // Story viewer state variables
    let activeStoryKey = null;
    let activeSlideIndex = 0;
    let storyTimer = null;
    let storyProgressPercent = 0;
    const SLIDE_DURATION = 5000; // 5 seconds per slide

    // Instagram feed data container
    let loadedInstagramItems = [];

    const instaFeedContainer = document.getElementById('insta-feed');
    const instaLightbox = document.getElementById('insta-lightbox');
    const storyViewer = document.getElementById('story-viewer');

    // Load feed items via API
    if (instaFeedContainer) {
        fetch('/api/instagram')
            .then(response => {
                if (!response.ok) throw new Error('API request failed');
                return response.json();
            })
            .then(res => {
                if (res.success && res.data && res.data.length > 0) {
                    loadedInstagramItems = res.data;
                    instaFeedContainer.innerHTML = ''; // Clear fallback
                    
                    res.data.forEach((item, index) => {
                        const mediaUrl = item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url;
                        const caption = item.caption || 'Elegant Crochet';
                        
                        const a = document.createElement('a');
                        a.href = '#';
                        a.className = 'insta-item';
                        a.setAttribute('data-index', index);
                        a.style.animationDelay = `${index * 100}ms`;
                        
                        const img = document.createElement('img');
                        img.src = mediaUrl;
                        img.alt = caption;
                        img.className = 'insta-img';
                        a.appendChild(img);
                        
                        if (item.media_type === 'VIDEO') {
                            const badge = document.createElement('div');
                            badge.className = 'insta-video-badge';
                            badge.innerHTML = '<i class="fas fa-play"></i>';
                            a.appendChild(badge);
                        }
                        
                        const overlay = document.createElement('div');
                        overlay.className = 'insta-overlay';
                        overlay.innerHTML = `
                            <div class="insta-overlay-content">
                                <i class="fab fa-instagram"></i>
                                <span data-i18n="view-post">Gönderiyi Gör</span>
                            </div>
                        `;
                        a.appendChild(overlay);
                        instaFeedContainer.appendChild(a);
                    });
                } else {
                    setupFallbackIndexes();
                }
            })
            .catch(error => {
                console.warn('Instagram API error, displaying static fallback content:', error);
                setupFallbackIndexes();
            });

        // Event delegation for clicking feed items
        instaFeedContainer.addEventListener('click', (e) => {
            const a = e.target.closest('.insta-item');
            if (!a) return;
            e.preventDefault();
            const index = parseInt(a.getAttribute('data-index'), 10);
            openFeedLightbox(index, a);
        });
    }

    function setupFallbackIndexes() {
        const items = instaFeedContainer.querySelectorAll('.insta-item');
        items.forEach((item, index) => {
            item.setAttribute('data-index', index);
            item.href = '#'; // Override direct link to support lightbox
        });
    }

    // --- Feed Lightbox Controls ---
    function openFeedLightbox(index, element) {
        if (!instaLightbox) return;
        
        const mediaContainer = document.getElementById('insta-lightbox-media');
        const captionContainer = document.getElementById('insta-lightbox-caption');
        const instaLink = document.getElementById('insta-lightbox-instagram-link');

        if (loadedInstagramItems && loadedInstagramItems[index]) {
            const item = loadedInstagramItems[index];
            mediaContainer.innerHTML = '';
            
            if (item.media_type === 'VIDEO') {
                const video = document.createElement('video');
                video.src = item.media_url;
                video.controls = true;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                mediaContainer.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = item.media_url;
                img.alt = item.caption || 'Elegant Crochet Post';
                mediaContainer.appendChild(img);
            }
            
            captionContainer.textContent = item.caption || 'Elegant Crochet el emeği ürünlerimiz.';
            instaLink.href = item.permalink || 'https://www.instagram.com/elegantcrochet2026/';
        } else {
            // Fallback content parsing
            const imgElement = element.querySelector('.insta-img');
            mediaContainer.innerHTML = '';
            if (imgElement) {
                const img = document.createElement('img');
                img.src = imgElement.src;
                img.alt = 'Elegant Crochet Fallback';
                mediaContainer.appendChild(img);
            }
            captionContainer.textContent = "Elegant Crochet ile sofralarınıza lüks bir dokunuş katın. Tamamı titizlikle ve el emeğiyle hazırlanan supla, runner ve çanta tasarımlarımız hakkında detaylı bilgi ve özel siparişleriniz için bizimle WhatsApp üzerinden de dilediğiniz an iletişime geçebilirsiniz. ✨";
            instaLink.href = 'https://www.instagram.com/elegantcrochet2026/';
        }

        instaLightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeFeedLightbox() {
        if (!instaLightbox) return;
        
        // Stop any playing video
        const mediaContainer = document.getElementById('insta-lightbox-media');
        if (mediaContainer) {
            const video = mediaContainer.querySelector('video');
            if (video) video.pause();
        }

        instaLightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Bind Feed Lightbox close elements
    const instaLightboxClose = document.getElementById('insta-lightbox-close');
    const lightboxBg = document.querySelector('.insta-lightbox-bg');
    if (instaLightboxClose) instaLightboxClose.addEventListener('click', closeFeedLightbox);
    if (lightboxBg) lightboxBg.addEventListener('click', closeFeedLightbox);


    // --- Stories Highlights Controls ---
    const storyBubbles = document.querySelectorAll('.story-bubble');
    storyBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            const key = bubble.getAttribute('data-story');
            if (key && STORIES_DATA[key]) {
                openStory(key);
            }
        });
    });

    function openStory(key) {
        if (!storyViewer) return;
        activeStoryKey = key;
        activeSlideIndex = 0;
        
        storyViewer.classList.add('active');
        document.body.classList.add('no-scroll');
        
        createProgressBars();
        loadStorySlide();
    }

    function createProgressBars() {
        const progressContainer = document.getElementById('story-progress');
        if (!progressContainer) return;
        progressContainer.innerHTML = '';
        
        const slides = STORIES_DATA[activeStoryKey].slides;
        slides.forEach((_, index) => {
            const bar = document.createElement('div');
            bar.className = 'story-progress-bar';
            bar.setAttribute('data-index', index);
            
            const fill = document.createElement('div');
            fill.className = 'story-progress-fill';
            bar.appendChild(fill);
            
            progressContainer.appendChild(bar);
        });
    }

    function loadStorySlide() {
        const slideBody = document.getElementById('story-slide-body');
        const timeLabel = document.getElementById('story-time');
        if (!slideBody) return;
        
        const slide = STORIES_DATA[activeStoryKey].slides[activeSlideIndex];
        slideBody.innerHTML = '';
        
        if (slide.type === 'video') {
            const video = document.createElement('video');
            video.src = slide.url;
            video.autoplay = true;
            video.playsInline = true;
            video.muted = false;
            slideBody.appendChild(video);
        } else {
            const img = document.createElement('img');
            img.src = slide.url;
            img.alt = 'Story Slide';
            slideBody.appendChild(img);
        }

        if (timeLabel) {
            let timeText = slide.time || '1s';
            const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'tr') === 'en';
            if (isEn) {
                timeText = timeText
                    .replace('sa', 'h')
                    .replace('dk', 'm')
                    .replace('g', 'd')
                    .replace('h', 'w');
            }
            timeLabel.textContent = timeText;
        }
        
        updateProgressBarsUI();
        startStoryTimer();
    }

    function updateProgressBarsUI() {
        const bars = document.querySelectorAll('.story-progress-bar');
        bars.forEach((bar, index) => {
            const fill = bar.querySelector('.story-progress-fill');
            if (index < activeSlideIndex) {
                fill.className = 'story-progress-fill filled';
                fill.style.width = '100%';
            } else if (index > activeSlideIndex) {
                fill.className = 'story-progress-fill';
                fill.style.width = '0%';
            } else {
                fill.className = 'story-progress-fill';
                fill.style.width = '0%';
            }
        });
    }

    function startStoryTimer() {
        if (storyTimer) clearInterval(storyTimer);
        
        const activeBar = document.querySelector(`.story-progress-bar[data-index="${activeSlideIndex}"] .story-progress-fill`);
        if (!activeBar) return;
        
        storyProgressPercent = 0;
        const tickRate = 40; // update UI every 40ms
        const step = (tickRate / SLIDE_DURATION) * 100;
        
        storyTimer = setInterval(() => {
            storyProgressPercent += step;
            if (storyProgressPercent >= 100) {
                storyProgressPercent = 100;
                activeBar.style.width = '100%';
                activeBar.classList.add('filled');
                clearInterval(storyTimer);
                handleStoryNext();
            } else {
                activeBar.style.width = `${storyProgressPercent}%`;
            }
        }, tickRate);
    }

    function handleStoryNext() {
        const slides = STORIES_DATA[activeStoryKey].slides;
        if (activeSlideIndex < slides.length - 1) {
            activeSlideIndex++;
            loadStorySlide();
        } else {
            closeStoryViewer();
        }
    }

    function handleStoryPrev() {
        if (activeSlideIndex > 0) {
            activeSlideIndex--;
            loadStorySlide();
        } else {
            // Restart slide
            loadStorySlide();
        }
    }

    function closeStoryViewer() {
        if (!storyViewer) return;
        if (storyTimer) clearInterval(storyTimer);
        storyViewer.classList.remove('active');
        document.body.classList.remove('no-scroll');
        activeStoryKey = null;
    }

    // Bind story navigation events
    const storyClose = document.getElementById('story-close');
    const storyBg = document.querySelector('.story-viewer-bg');
    const storyPrevBtn = document.getElementById('story-prev');
    const storyNextBtn = document.getElementById('story-next');

    if (storyClose) storyClose.addEventListener('click', closeStoryViewer);
    if (storyBg) storyBg.addEventListener('click', closeStoryViewer);
    if (storyPrevBtn) storyPrevBtn.addEventListener('click', handleStoryPrev);
    if (storyNextBtn) storyNextBtn.addEventListener('click', handleStoryNext);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStoryViewer();
            closeFeedLightbox();
        }
    });
});
