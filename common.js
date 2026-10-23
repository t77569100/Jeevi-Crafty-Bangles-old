/* Shared demo-store helpers. Data is saved in this browser/device only. */
const STORAGE_KEYS = { products: "jeevi_products_v1", cart: "jeevi_cart_v1", orders: "jeevi_demo_orders_v1", auth: "jeevi_demo_admin_v1" };

const DEFAULT_PRODUCTS = [
  {id:"p1",name:"Pink Craft Bangles",price:199,category:"Bangles",image:"images/image1.png",description:"Beautiful handmade bangles with a lovely pink and gold finish."},
  {id:"p2",name:"Designer Craft Bangles",price:249,category:"Bangles",image:"images/image2.png",description:"A special handmade bangle set, carefully crafted with love."},
  {id:"p3",name:"Colorful Bangles",price:299,category:"Bangles",image:"images/image3.png",description:"Colorful bangles for festive and everyday looks."},
  {id:"p4",name:"Traditional Bangles",price:349,category:"Bangles",image:"images/image4.png",description:"Traditional-style handmade bangles for special occasions."}
];

function readStore(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getProducts() {
  const stored = readStore(STORAGE_KEYS.products, null);
  if (Array.isArray(stored) && stored.length) return stored;
  writeStore(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS.map(p => ({...p}));
}
function saveProducts(items) { writeStore(STORAGE_KEYS.products, items); }
function getCart() { return readStore(STORAGE_KEYS.cart, []); }
function saveCart(items) { writeStore(STORAGE_KEYS.cart, items); }
function money(value) { return "₹" + Number(value || 0).toLocaleString("en-IN"); }
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function updateHeaderCartCount() {
  const el = document.getElementById("header-cart-count");
  if (el) el.textContent = getCart().reduce((sum, item) => sum + item.quantity, 0);
}
function addProductToCart(id, suppliedProduct = null) {
  const product = suppliedProduct || getProducts().find(p => p.id === id);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({id:product.id,name:product.name,price:product.price,image:product.image,quantity:1});
  saveCart(cart);
  updateHeaderCartCount();
}
function showSplashIfPresent() {
  const splash = document.getElementById("splash-screen");
  const app = document.getElementById("app");
  if (!splash || !app) return;
  window.addEventListener("load", () => setTimeout(() => {
    splash.style.opacity = "0";
    setTimeout(() => { splash.classList.add("hidden"); app.classList.remove("hidden"); }, 350);
  }, 1500));
}
document.addEventListener("DOMContentLoaded", () => { updateHeaderCartCount(); showSplashIfPresent(); });