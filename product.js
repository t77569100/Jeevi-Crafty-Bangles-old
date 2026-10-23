const params = new URLSearchParams(location.search); const productId = params.get('id'); const root = document.getElementById('product-detail');
async function showProduct() {
  root.innerHTML = '<p class="muted">Loading product…</p>';
  try {
    const products = await window.JeeviFirebase.getProducts(); const product = products.find(p => p.id === productId);
    if (!product) { root.innerHTML = '<div class="empty-state"><h2>Product not found</h2><p>This product may have been removed.</p><p><a href="index.html">Return to shop</a></p></div>'; return; }
    root.replaceChildren(); const img=document.createElement('img'); img.className='detail-image'; img.src=product.image||'images/logo.png'; img.alt=product.name; img.onerror=()=>{img.onerror=null;img.src='images/logo.png';};
    const info=document.createElement('div'); info.className='detail-info'; const category=document.createElement('p'); category.className='eyebrow'; category.textContent=product.category||'Handmade';
    const title=document.createElement('h1'); title.textContent=product.name; const price=document.createElement('p'); price.className='detail-price'; price.textContent=money(product.price);
    const desc=document.createElement('p'); desc.className='detail-description'; desc.textContent=product.description||'A handmade creation made with love.';
    const add=document.createElement('button'); add.className='btn'; add.textContent='Add to Cart 🛒'; add.addEventListener('click',()=>{addProductToCart(product.id, product);add.textContent='Added to Cart ✓';}); info.append(category,title,price,desc,add); root.append(img,info);
  } catch(e) { root.innerHTML='<p class="empty-state">Product load ஆகவில்லை. Internet / Firestore Rules சரிபார்க்கவும்.</p>'; console.error(e); }
}
showProduct();