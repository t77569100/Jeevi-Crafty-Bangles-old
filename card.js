function renderCart() {
  const root = document.getElementById("cart-items");
  const cart = getCart();
  root.replaceChildren();
  if (!cart.length) { root.innerHTML = '<div class="empty-state"><h3>Your cart is empty 🛒</h3><p>Add a handmade favourite from the shop.</p><p><a href="index.html">Explore products</a></p></div>'; }
  let total = 0;
  cart.forEach(item => {
    total += Number(item.price) * Number(item.quantity);
    const row = document.createElement("article"); row.className = "cart-row";
    const img = document.createElement("img"); img.src = item.image; img.alt = item.name;
    img.onerror = () => { img.onerror = null; img.src = "images/logo.png"; };
    const body = document.createElement("div");
    const title = document.createElement("h3"); title.textContent = item.name;
    const line = document.createElement("p"); line.textContent = `${money(item.price)} each · Subtotal ${money(item.price * item.quantity)}`;
    const controls = document.createElement("div"); controls.className = "row-bottom";
    const minus = document.createElement("button"); minus.type="button"; minus.className = "qty-btn"; minus.textContent = "−"; minus.setAttribute("aria-label","Decrease quantity");
    minus.addEventListener("click", () => changeQuantity(item.id,-1));
    const qty = document.createElement("span"); qty.textContent = item.quantity;
    const plus = document.createElement("button"); plus.type="button"; plus.className = "qty-btn"; plus.textContent = "+"; plus.setAttribute("aria-label","Increase quantity");
    plus.addEventListener("click", () => changeQuantity(item.id,1));
    const remove = document.createElement("button"); remove.type="button"; remove.className = "remove-btn"; remove.textContent = "Remove";
    remove.addEventListener("click", () => { saveCart(getCart().filter(p=>p.id!==item.id)); renderCart(); updateHeaderCartCount(); });
    controls.append(minus,qty,plus,remove); body.append(title,line,controls); row.append(img,body); root.appendChild(row);
  });
  document.getElementById("cart-total").textContent = money(total);
  document.getElementById("checkout-button").disabled = cart.length === 0;
}
function changeQuantity(id,delta) {
  let cart = getCart(); const item = cart.find(p=>p.id===id); if (!item) return;
  item.quantity += delta; if (item.quantity <= 0) cart = cart.filter(p=>p.id!==id);
  saveCart(cart); renderCart(); updateHeaderCartCount();
}
document.getElementById("checkout-form").addEventListener("submit", async event => {
  event.preventDefault();
  const cart = getCart(); const message = document.getElementById("checkout-message");
  if (!cart.length) { message.textContent = "Your cart is empty."; return; }
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  if (!name || !address || !/^[6-9][0-9]{9}$/.test(phone)) { message.textContent = "Please check your name, address and 10-digit Indian mobile number."; return; }
  const payment = form.querySelector('input[name="payment"]:checked').value;
  const total = cart.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0);
  const order = {customer:{name,phone,address},items:cart.map(i=>({...i})),total};
  try {
    if (!window.JeeviFirebase || !window.JeeviFirebase.auth.currentUser) {
      message.textContent = "Order செய்ய முதலில் mobile OTP login செய்யவும்.";
      location.href = "login.html";
      return;
    }
    const orderId = await window.JeeviFirebase.saveOrder(order);
    message.textContent = `Order ${orderId} Firestore-ல் சேமிக்கப்பட்டது. Payment demo மட்டும்; பணம் வசூலிக்கப்படவில்லை.`;
    saveCart([]); renderCart(); updateHeaderCartCount();
    document.getElementById("checkout-button").disabled = true;
  } catch (e) {
    message.textContent = e.message || "Order சேமிக்க முடியவில்லை. Firebase configuration மற்றும் Firestore rules சரிபார்க்கவும்.";
  }
});
renderCart();
