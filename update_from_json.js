const fs = require('fs');

const products = JSON.parse(fs.readFileSync('/tmp/shopier_scraper/products.json', 'utf8'));
console.log(`Loaded ${products.length} products.`);

const categories = [
    { id: 'cat-polyester', title: 'Polyester Supla Takımları', keywords: [/polyester/i] },
    { id: 'cat-koton', title: 'Koton Supla Takımları', keywords: [/koton/i] },
    { id: 'cat-cocuk', title: 'Çocuk Çantaları', keywords: [/çocuk/i, /cocuk/i] },
    { id: 'cat-sirt-cantasi', title: 'Sırt Çantaları', keywords: [/sırt/i, /sirt/i] },
    { id: 'cat-runner', title: 'Runner', keywords: [/runner/i] },
    { id: 'cat-kol', title: 'Kol Çantası', keywords: [/kol çantası/i, /tasarım çanta/i, /boho/i, /canta/i, /portföy/i] },
    { id: 'cat-anahtarlik', title: 'Anahtarlık', keywords: [/anahtarlık/i, /charm/i, /figür/i] },
    { id: 'cat-amigurumi', title: 'Amigurumi', keywords: [/amigurumi/i, /figür/i, /penguen/i, /kuğu/i, /zürafa/i, /kulaklık kılıfı/i] },
    { id: 'cat-gozluk', title: 'Gözlük Kılıfları', keywords: [/gözlük/i, /gozluk/i] }
];

const categorizedProducts = {};
categories.forEach(c => categorizedProducts[c.id] = []);

products.forEach(p => {
    let placed = false;
    for (const cat of categories) {
        if (cat.keywords.some(kw => kw.test(p.title))) {
            categorizedProducts[cat.id].push(p);
            placed = true;
        }
    }
    
    if (!placed) {
        console.log("Uncategorized: ", p.title);
        // Put in amigurumi by default
        categorizedProducts['cat-amigurumi'].push(p);
    }
});

let htmlOutput = `    <section class="products section-padding" id="products">
        <div class="container">
            <div class="section-header reveal">
                <h3 class="section-subtitle" data-i18n="products-subtitle">Koleksiyonumuz</h3>
                <h2 class="section-title" data-i18n="products-title">En Çok Tercih Edilenler</h2>
                <p data-i18n="products-desc">Masanızı zarifliğin zirvesine taşıyacak, özenle tasarlanmış favori parçalarımız.</p>
            </div>
`;

categories.forEach((cat, index) => {
    const items = categorizedProducts[cat.id];
    const marginTop = index === 0 ? '' : ' style="margin-top: 5rem;"';
    
    htmlOutput += `
            <!-- ${cat.title} -->
            <div class="category-section" id="${cat.id}"${marginTop}>
                <h3 class="category-title reveal">${cat.title}</h3>
                <div class="product-grid">
`;

    if (items.length === 0) {
        htmlOutput += `                    <p style="grid-column: 1 / -1; text-align: center; color: var(--color-text-light); padding: 2rem;">Şu an bu kategoride aktif ürün bulunmamaktadır.</p>\n`;
    } else {
        items.forEach((item, i) => {
            const delay = (i % 4) + 1;
            
            // Handle sold out items
            const badgeHtml = item.isSoldOut ? `<div class="product-overlay" style="background: rgba(255,255,255,0.7); display:flex; align-items:center; justify-content:center;"><span style="background:#c98693; color:white; padding:5px 15px; border-radius:20px; font-weight:bold;" data-i18n="sold-out">Tükendi</span></div>` : `                            <div class="product-overlay">
                                <button class="btn btn-outline compact lightbox-trigger" data-image="${item.image}" data-caption="${item.title}"><span data-i18n="view-image">Resmi Gör</span></button>
                            </div>`;
                            
            const buyButtonHtml = item.isSoldOut ? `<a href="${item.url}" target="_blank" class="btn-product-buy" style="background-color: #ddd; color: #666; cursor: not-allowed; pointer-events: none;"><i class="fas fa-shopping-bag"></i> <span data-i18n="sold-out">Tükendi</span></a>` : `<a href="${item.url}" target="_blank" class="btn-product-buy"><i class="fas fa-shopping-bag"></i> <span data-i18n="buy-now">Hemen Satın Al</span></a>`;

            htmlOutput += `                    <div class="product-card reveal reveal-up fade-delay-${delay}">
                        <div class="product-img-wrapper">
                            <img src="${item.image}" alt="${item.title}">
${badgeHtml}
                        </div>
                        <div class="product-info">
                            <h4>${item.title}</h4>
                            <p class="price">${item.price}</p>
                            ${buyButtonHtml}
                        </div>
                    </div>
`;
        });
    }

    htmlOutput += `                </div>
            </div>
`;
});

htmlOutput += `        </div>
    </section>`;

const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');
const startMarker = '<section class="products section-padding" id="products">';
const endMarker = '    <!-- Why Us Section -->';
const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = indexHtml.substring(0, startIndex) + htmlOutput + '\n\n' + indexHtml.substring(endIndex);
    fs.writeFileSync(indexPath, newContent, 'utf8');
    console.log("Successfully updated index.html with all 37 products!");
} else {
    console.log("Error finding section bounds in index.html");
}
