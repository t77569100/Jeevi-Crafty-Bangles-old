let homeCategory = "All";
let allProducts = [];
async function renderHomeProducts() {
  const list = document.getElementById("product-list");
  if (!list) return;
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const items = allProducts.filter(p => (homeCategory === "All" || p.category === homeCategory) &&
    (String(p.name||'').toLowerCase().includes(query) || String(p.description||'').toLowerCase().includes(query)));
  list.replaceChildren();
  if (!items.length) { list.innerHTML = '<p class="empty-state">No products found yet. Please check back soon.</p>'; return; }
  items.forEach(p => {
    const card = document.createElement("article"); card.className = "product-card";
    const link = document.createElement("a"); link.href = `product.html?id=${encodeURIComponent(p.id)}`;
    const img = document.createElement("img"); img.src = p.image || 'images/logo.png'; img.alt = p.name; img.loading = "lazy";
    img.onerror = () => { img.onerror = null; img.src = "images/logo.png"; }; link.appendChild(img);
    const info = document.createElement("div"); info.className = "product-info";
    const name = document.createElement("h3"); name.textContent = p.name;
    const price = document.createElement("p"); price.className = "price"; price.textContent = money(p.price);
    const actions = document.createElement("div"); actions.className = "product-actions";
    const view = document.createElement("button"); view.className = "view-btn"; view.textContent = "View"; view.addEventListener("click", () => location.href = link.href);
    const add = document.createElement("button"); add.textContent = "Add to Cart"; add.addEventListener("click", () => { addProductToCart(p.id, p); add.textContent = "Added ✓"; setTimeout(()=>add.textContent="Add to Cart",900); });
    actions.append(view, add); info.append(name, price, actions); card.append(link, info); list.appendChild(card);
  });
}
async function loadProducts() {
  const list = document.getElementById('product-list'); list.innerHTML = '<p class="muted">Loading products…</p>';
  try { allProducts = await window.JeeviFirebase.getProducts(); await renderHomeProducts(); }
  catch (e) { list.innerHTML = '<p class="empty-state">Products load ஆகவில்லை. Internet / Firestore Rules சரிபார்க்கவும்.</p>'; console.error(e); }
}
document.getElementById("search-input").addEventListener("input", renderHomeProducts);
document.querySelectorAll("[data-category]").forEach(btn => btn.addEventListener("click", () => { homeCategory=btn.dataset.category; document.querySelectorAll("[data-category]").forEach(b=>b.classList.toggle("active",b===btn)); renderHomeProducts(); }));
loadProducts();