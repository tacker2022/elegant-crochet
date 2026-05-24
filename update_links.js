const fs = require('fs');

const indexPath = 'index.html';
let content = fs.readFileSync(indexPath, 'utf8');

// Replace the closing div of product-info with the button and then closing div
// Wait, the regex should match:
// <div class="product-info">\s*<h4>(.*?)<\/h4>\s*<p class="price">(.*?)<\/p>\s*<\/div>
// And replace with:
// <div class="product-info">\n                            <h4>$1</h4>\n                            <p class="price">$2</p>\n                            <a href="https://www.shopier.com/ElegantCrochet" target="_blank" class="btn-product-buy"><i class="fas fa-shopping-bag"></i> Hemen Satın Al</a>\n                        </div>

content = content.replace(
    /<div class="product-info">\s*<h4>(.*?)<\/h4>\s*<p class="price">(.*?)<\/p>\s*<\/div>/g,
    `<div class="product-info">
                            <h4>$1</h4>
                            <p class="price">$2</p>
                            <a href="https://www.shopier.com/ElegantCrochet" target="_blank" class="btn-product-buy"><i class="fas fa-shopping-bag"></i> Hemen Satın Al</a>
                        </div>`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log("Updated index.html");
