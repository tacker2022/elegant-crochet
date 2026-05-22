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
            const caption = item.caption || 'Elegant Crochet';
            
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
                    <span>Gönderiyi Gör</span>
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
        if (!instaLightbox || !loadedGalleryItems[index]) return;
        
        const mediaContainer = document.getElementById('insta-lightbox-media');
        const captionContainer = document.getElementById('insta-lightbox-caption');
        const instaLink = document.getElementById('insta-lightbox-instagram-link');
        
        const item = loadedGalleryItems[index];
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

    // Escape key press to close lightbox
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFeedLightbox();
        }
    });
});
