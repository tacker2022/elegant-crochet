// galeri.js - Elegant Crochet Gallery Controller

document.addEventListener('DOMContentLoaded', () => {
    // --- 0. Preloader Logic ---
    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }
    };

    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, 1000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(hidePreloader, 1000);
        });
    }
    setTimeout(hidePreloader, 3000); // safety fallback

    // --- 1. Mobile Menu Logic ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    // --- 2. Instagram Gallery Logic ---
    const galleryLoader = document.getElementById('gallery-loader');
    const galleryFeed = document.getElementById('gallery-feed');
    const instaLightbox = document.getElementById('insta-lightbox');
    
    let loadedGalleryItems = [];

    const fallbackTranslations = new Map([
        ["fb1", {
            tr: 'Cozy tığ işi el emeği supla modellerimiz ile masalarınıza sıcaklık katın. ✨',
            en: 'Add warmth to your tables with our cozy handmade crochet charger models. ✨'
        }],
        ["fb2", {
            tr: 'Zarif detaylar ve en kaliteli pamuk iplikleriyle işlenmiş runner takımlarımız.',
            en: 'Our runner sets, crafted with elegant details and the highest quality cotton yarns.'
        }],
        ["fb3", {
            tr: 'Masalarınız için premium runner örtü. Farklı renk seçenekleriyle siparişe hazır. 🧶',
            en: 'Premium table runner for your dining tables. Ready to order in various colors. 🧶'
        }],
        ["fb4", {
            tr: 'Paketleme sürecimiz de en az tasarımlarımız kadar özenli ve hediye kalitesinde. 🎁',
            en: 'Our packaging process is just as careful and elegant as our designs, perfect for gifting. 🎁'
        }],
        ["fb5", {
            tr: 'Sizden gelenler köşesinde bugün! Sizlerin güzel sunumları bizim en büyük mutluluğumuz.',
            en: 'Today in our customer showcase! Your beautiful presentations are our greatest happiness.'
        }],
        ["fb6", {
            tr: 'Doğal ipliklerden üretilen, yıkanabilir ve uzun ömürlü el işi supla tasarımları.',
            en: 'Handmade charger designs made of natural yarns, washable and long-lasting.'
        }],
        ["fb7", {
            tr: 'Gri tonlarının asil ve modern duruşu. Her türlü yemek takımıyla mükemmel uyum.',
            en: 'The noble and modern stance of gray tones. Perfect match for any dinnerware set.'
        }],
        ["fb8", {
            tr: 'Her ilmekte zarafet barındıran atölye günlüklerimizden bir kare. 🤎',
            en: 'A capture from our workshop diaries containing elegance in every single stitch. 🤎'
        }],
        ["fb9", {
            tr: 'Elegant Crochet ile sofra zarafetinizi en üst seviyeye taşıyın.',
            en: 'Elevate your table elegance to the highest level with Elegant Crochet.'
        }],
        ["fb10", {
            tr: 'Lüks el emeği tığ işi supla ve runner takımları ile sofranızı güzelleştirin.',
            en: 'Beautify your table with luxury handmade crochet charger and runner sets.'
        }],
        ["fb11", {
            tr: 'El emeği ile hazırlanan tığ işi tasarımlarımız hakkında bilgi ve sipariş için DM veya WhatsApp.',
            en: 'For information and ordering about our handmade crochet designs, contact via DM or WhatsApp.'
        }],
        ["fb12", {
            tr: 'Her bir ilmeği özenle dokunmuş runner örtülerimizle evinizi şımartın.',
            en: 'Spoil your home with our table runners, where every single stitch is carefully woven.'
        }]
    ]);

    const fallbackItems = [
        { id: "fb1", media_type: 'IMAGE', media_url: 'assets/product-1.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Cozy tığ işi el emeği supla modellerimiz ile masalarınıza sıcaklık katın. ✨' },
        { id: "fb2", media_type: 'IMAGE', media_url: 'assets/product-2.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Zarif detaylar ve en kaliteli pamuk iplikleriyle işlenmiş runner takımlarımız.' },
        { id: "fb3", media_type: 'IMAGE', media_url: 'assets/product-runner.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Masalarınız için premium runner örtü. Farklı renk seçenekleriyle siparişe hazır. 🧶' },
        { id: "fb4", media_type: 'IMAGE', media_url: 'assets/product-4.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Paketleme sürecimiz de en az tasarımlarımız kadar özenli ve hediye kalitesinde. 🎁' },
        { id: "fb5", media_type: 'IMAGE', media_url: 'assets/product-5.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Sizden gelenler köşesinde bugün! Sizlerin güzel sunumları bizim en büyük mutluluğumuz.' },
        { id: "fb6", media_type: 'IMAGE', media_url: 'assets/product-6.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Doğal ipliklerden üretilen, yıkanabilir ve uzun ömürlü el işi supla tasarımları.' },
        { id: "fb7", media_type: 'IMAGE', media_url: 'assets/product-gray.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Gri tonlarının asil ve modern duruşu. Her türlü yemek takımıyla mükemmel uyum.' },
        { id: "fb8", media_type: 'IMAGE', media_url: 'assets/product-8.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Her ilmekte zarafet barındıran atölye günlüklerimizden bir kare. 🤎' },
        { id: "fb9", media_type: 'IMAGE', media_url: 'assets/about.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Elegant Crochet ile sofra zarafetinizi en üst seviyeye taşıyın.' },
        { id: "fb10", media_type: 'IMAGE', media_url: 'assets/hero-v2.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Lüks el emeği tığ işi supla ve runner takımları ile sofranızı güzelleştirin.' },
        { id: "fb11", media_type: 'IMAGE', media_url: 'assets/product-1.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'El emeği ile hazırlanan tığ işi tasarımlarımız hakkında bilgi ve sipariş için DM veya WhatsApp.' },
        { id: "fb12", media_type: 'IMAGE', media_url: 'assets/product-runner.jpg', permalink: 'https://www.instagram.com/elegantcrochet2026/', caption: 'Her bir ilmeği özenle dokunmuş runner örtülerimizle evinizi şımartın.' }
    ];

    const renderGallery = (items) => {
        if (!galleryFeed) return;
        
        galleryFeed.innerHTML = '';
        
        items.forEach((item, index) => {
            const mediaUrl = item.media_type === 'VIDEO' ? (item.thumbnail_url || item.media_url) : item.media_url;
            
            let caption = item.caption || 'Elegant Crochet';
            const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'tr') === 'en';
            const translation = item.id ? fallbackTranslations.get(item.id) : null;
            if (translation) {
                caption = isEn ? translation.en : translation.tr;
            }
            
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'insta-item';
            a.setAttribute('data-index', index);
            a.style.animationDelay = `${(index % 12) * 50}ms`; // staggered animations
            
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = caption;
            img.className = 'insta-img';
            img.loading = 'lazy'; // native lazy loading
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
            galleryFeed.appendChild(a);
        });

        // Hide loader and show grid
        if (galleryLoader) galleryLoader.style.display = 'none';
        galleryFeed.style.opacity = '1';
    };

    // Load media data (limit 50)
    fetch('/api/instagram?limit=50')
        .then(response => {
            if (!response.ok) throw new Error('API request failed');
            return response.json();
        })
        .then(res => {
            if (res.success && res.data && res.data.length > 0) {
                loadedGalleryItems = res.data;
                renderGallery(res.data);
            } else {
                console.warn('API succeeded but returned no data, using fallbacks');
                loadedGalleryItems = fallbackItems;
                renderGallery(fallbackItems);
            }
        })
        .catch(error => {
            console.warn('API call failed, displaying static fallback content:', error);
            loadedGalleryItems = fallbackItems;
            renderGallery(fallbackItems);
        });

    // --- 3. Lightbox Controls ---
    const openFeedLightbox = (index) => {
        const item = loadedGalleryItems.at(index);
        if (!instaLightbox || !item) return;
        
        const mediaContainer = document.getElementById('insta-lightbox-media');
        const captionContainer = document.getElementById('insta-lightbox-caption');
        const instaLink = document.getElementById('insta-lightbox-instagram-link');
        
        mediaContainer.innerHTML = '';
        
        let caption = item.caption || 'Elegant Crochet';
        const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'tr') === 'en';
        const translation = item.id ? fallbackTranslations.get(item.id) : null;
        if (translation) {
            caption = isEn ? translation.en : translation.tr;
        }
        
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
            img.alt = caption;
            mediaContainer.appendChild(img);
        }
        
        captionContainer.textContent = caption;
        instaLink.href = item.permalink || 'https://www.instagram.com/elegantcrochet2026/';
        
        instaLightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    };

    const closeFeedLightbox = () => {
        if (!instaLightbox) return;
        
        // Stop video if playing
        const mediaContainer = document.getElementById('insta-lightbox-media');
        if (mediaContainer) {
            const video = mediaContainer.querySelector('video');
            if (video) video.pause();
        }
        
        instaLightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    // Event delegation on grid clicks
    if (galleryFeed) {
        galleryFeed.addEventListener('click', (e) => {
            const a = e.target.closest('.insta-item');
            if (!a) return;
            e.preventDefault();
            const index = parseInt(a.getAttribute('data-index'), 10);
            openFeedLightbox(index);
        });
    }

    // Bind Close events
    const instaLightboxClose = document.getElementById('insta-lightbox-close');
    const lightboxBg = document.querySelector('.insta-lightbox-bg');
    if (instaLightboxClose) instaLightboxClose.addEventListener('click', closeFeedLightbox);
    if (lightboxBg) lightboxBg.addEventListener('click', closeFeedLightbox);

    // Escape key press to close lightbox and share modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFeedLightbox();
            closeShareModal();
        }
    });

    window.addEventListener('languageChanged', (e) => {
        renderGallery(loadedGalleryItems);
    });

    // --- 9. Premium Sharing Button Integration ---
    const shareFloatBtn = document.getElementById('share-float-btn');
    const shareModal = document.getElementById('share-modal');
    const shareModalClose = document.getElementById('share-modal-close');
    const shareCopyBtn = document.getElementById('share-copy-btn');
    const toastAlert = document.getElementById('toast-alert');

    function closeShareModal() {
        if (shareModal) shareModal.classList.remove('active');
    }

    if (shareFloatBtn) {
        shareFloatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Open custom glassmorphism share modal directly for a fully branded premium experience
            if (shareModal) {
                shareModal.classList.add('active');
            }
        });
    }

    if (shareModalClose) {
        shareModalClose.addEventListener('click', closeShareModal);
    }

    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                closeShareModal();
            }
        });
    }

    // Direct click listeners for the share options to ensure they always work
    const shareWa = document.getElementById('share-wa');
    const sharePin = document.getElementById('share-pin');
    const shareFb = document.getElementById('share-fb');

    if (shareWa) {
        shareWa.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            const text = `${document.title} - ${url}`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        });
    }

    if (sharePin) {
        sharePin.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            const media = 'https://elegantcrochet.net/assets/about.jpg';
            window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(document.title)}`, '_blank');
        });
    }

    if (shareFb) {
        shareFb.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        });
    }

    const shareIg = document.getElementById('share-ig');
    if (shareIg) {
        shareIg.addEventListener('click', (e) => {
            e.preventDefault();
            const url = window.location.href;
            
            if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                navigator.share({
                    title: document.title,
                    text: 'Zarif el emeği tığ işi tasarımlar. ✨',
                    url: url
                })
                .then(() => closeShareModal())
                .catch(err => console.log('Error sharing:', err));
            } else {
                navigator.clipboard.writeText(url)
                    .then(() => {
                        closeShareModal();
                        
                        const toastMsg = document.getElementById('toast-message');
                        if (toastMsg) {
                            const isEn = (window.currentLang === 'en');
                            toastMsg.innerText = isEn 
                                ? "Link copied! Redirecting to Instagram profile. ✨" 
                                : "Bağlantı kopyalandı! Instagram hesabımıza yönlendiriliyorsunuz. ✨";
                        }
                        
                        if (toastAlert) {
                            toastAlert.classList.add('show');
                            setTimeout(() => {
                                toastAlert.classList.remove('show');
                                setTimeout(() => {
                                    if (toastMsg) {
                                        const isEn = (window.currentLang === 'en');
                                        toastMsg.innerText = isEn ? "Link copied! ✨" : "Bağlantı kopyalandı! ✨";
                                    }
                                }, 300);
                            }, 4000);
                        }
                        
                        setTimeout(() => {
                            window.open('https://www.instagram.com/elegantcrochet2026/', '_blank');
                        }, 1200);
                    })
                    .catch(err => {
                        console.error('Could not copy link:', err);
                        window.open('https://www.instagram.com/elegantcrochet2026/', '_blank');
                    });
            }
        });
    }

    if (shareCopyBtn) {
        shareCopyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    closeShareModal();
                    
                    // Show premium rose-colored toast notification
                    if (toastAlert) {
                        toastAlert.classList.add('show');
                        setTimeout(() => {
                            toastAlert.classList.remove('show');
                        }, 3000);
                    }
                })
                .catch(err => {
                    console.error('Could not copy link:', err);
                });
        });
    }

    // --- 10. Simulated Viewer Count Widget ---
    const viewerWidget = document.getElementById('viewer-count-widget');
    const viewerNumberEl = document.getElementById('viewer-number');
    
    if (viewerWidget && viewerNumberEl) {
        // Show widget after 2 seconds
        setTimeout(() => {
            viewerWidget.classList.remove('hidden');
        }, 2000);

        // Initial base number (between 4 and 9)
        let currentViewers = Math.floor(Math.random() * 6) + 4;
        viewerNumberEl.textContent = currentViewers;

        // Function to randomly update the number
        const updateViewers = () => {
            const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const largerChange = Math.random() > 0.8 ? (Math.random() > 0.5 ? 2 : -2) : 0;
            currentViewers = currentViewers + change + largerChange;

            if (currentViewers < 3) currentViewers = 3 + Math.floor(Math.random() * 2);
            if (currentViewers > 18) currentViewers = 18 - Math.floor(Math.random() * 2);

            viewerNumberEl.classList.add('changed');
            
            setTimeout(() => {
                viewerNumberEl.textContent = currentViewers;
            }, 150);

            setTimeout(() => {
                viewerNumberEl.classList.remove('changed');
            }, 300);

            const nextUpdate = Math.floor(Math.random() * 6000) + 4000;
            setTimeout(updateViewers, nextUpdate);
        };

        setTimeout(updateViewers, 5000);
    }

});
