const fs = require('fs');

const rawHtml = fs.readFileSync('shopier_dump2.html', 'utf8');

// Regex to match a product card
// We need to capture: href, img src, title, price
const productRegex = /<div class="product-card shopier--product-card product-card-store">[\s\S]*?<a\s+href="([^"]+)"[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="shopier-store--store-product-card-title">([^<]+)<\/h3>[\s\S]*?data-price="([^"]+)"/g;

let match;
const products = [];

while ((match = productRegex.exec(rawHtml)) !== null) {
    products.push({
        url: match[1].trim(),
        image: match[2].trim(),
        title: match[3].trim(),
        price: match[4].trim()
    });
}

console.log(`Found ${products.length} products.`);

const categories = [
    { id: 'cat-polyester', title: 'Polyester Supla Takımları', keywords: [/polyester/i] },
    { id: 'cat-koton', title: 'Koton Supla Takımları', keywords: [/koton/i] },
    { id: 'cat-cocuk', title: 'Çocuk Çantaları', keywords: [/çocuk/i, /cocuk/i] },
    { id: 'cat-sirt-cantasi', title: 'Sırt Çantaları', keywords: [/sırt/i, /sirt/i] },
    { id: 'cat-runner', title: 'Runner', keywords: [/runner/i] },
    { id: 'cat-kol', title: 'Kol Çantası', keywords: [/kol çantası/i, /tasarım çanta/i, /boho/i, /canta/i] },
    { id: 'cat-anahtarlik', title: 'Anahtarlık', keywords: [/anahtarlık/i, /charm/i] },
    { id: 'cat-amigurumi', title: 'Amigurumi', keywords: [/amigurumi/i, /figür/i, /penguen/i, /kuğu/i, /zürafa/i] },
    { id: 'cat-gozluk', title: 'Gözlük Kılıfları', keywords: [/gözlük/i, /gozluk/i] }
];

const categorizedProducts = {};
categories.forEach(c => categorizedProducts[c.id] = []);

// Special handling to avoid duplicates in Kol Çantası if it's already in Sırt/Çocuk
products.forEach(p => {
    let placed = false;
    
    // Order matters. Let's do a smart assignment.
    for (const cat of categories) {
        if (cat.keywords.some(kw => kw.test(p.title))) {
            categorizedProducts[cat.id].push(p);
            placed = true;
        }
    }
    
    // Fallback if not matched
    if (!placed) {
        // Just put in amigurumi or the first one if we can't tell, let's log them
        console.log("Uncategorized: ", p.title);
        categorizedProducts['cat-amigurumi'].push(p);
    }
});

let htmlOutput = `    <section class="products section-padding" id="products">
        <div class="container">
            <div class="section-header reveal">
                <h3 class="section-subtitle">Koleksiyonumuz</h3>
                <h2 class="section-title">En Çok Tercih Edilenler</h2>
                <p>Masanızı zarifliğin zirvesine taşıyacak, özenle tasarlanmış favori parçalarımız.</p>
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
            htmlOutput += `                    <div class="product-card reveal reveal-up fade-delay-${delay}">
                        <div class="product-img-wrapper">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="product-overlay">
                                <button class="btn btn-outline compact lightbox-trigger" data-image="${item.image}" data-caption="${item.title}">Resmi Gör</button>
                            </div>
                        </div>
                        <div class="product-info">
                            <h4>${item.title}</h4>
                            <p class="price">${item.price}</p>
                            <a href="${item.url}" target="_blank" class="btn-product-buy"><i class="fas fa-shopping-bag"></i> Hemen Satın Al</a>
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

// Now read index.html and replace
const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Regex to replace the entire <section class="products"...>...</section>
// Be careful with nested sections/divs! 
// Better approach: string splitting based on known markers.

const startMarker = '<section class="products section-padding" id="products">';
const endMarker = '    <!-- Why Us Section -->';

const startIndex = indexHtml.indexOf(startMarker);
const endIndex = indexHtml.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = indexHtml.substring(0, startIndex) + htmlOutput + '\n\n' + indexHtml.substring(endIndex);
    fs.writeFileSync(indexPath, newContent, 'utf8');
    console.log("Successfully updated index.html");
} else {
    console.log("Error finding section bounds in index.html");
}
