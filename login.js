const form = document.getElementById('login-form');
const message = document.getElementById('login-message');
const sendButton = document.getElementById('send-otp');
function firebaseReady() { return !!window.JeeviFirebase; }
function fullPhone() { return '+91' + document.getElementById('phone').value.trim(); }
sendButton.addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  if (!firebaseReady()) { message.textContent = 'Firebase load ஆகவில்லை. Website-ஐ HTTPS hosting அல்லது localhost வழியாகத் திறக்கவும்; file:// வழியாக வேண்டாம்.'; return; }
  sendButton.disabled = true; message.textContent = 'OTP அனுப்பப்படுகிறது…';
  try { await window.JeeviFirebase.sendOtp(fullPhone()); message.textContent = 'OTP அனுப்பப்பட்டது. SMS-ல் வந்த code-ஐ உள்ளிடவும்.'; }
  catch (e) { message.textContent = e.message || 'OTP அனுப்ப முடியவில்லை. Firebase Phone Auth, domain, quota ஆகியவற்றைச் சரிபார்க்கவும்.'; }
  finally { sendButton.disabled = false; }
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!firebaseReady()) { message.textContent = 'Firebase load ஆகவில்லை. HTTPS hosting தேவை.'; return; }
  const code = document.getElementById('otp').value.trim();
  if (!/^\d{6}$/.test(code)) { message.textContent = '6-digit OTP உள்ளிடவும்.'; return; }
  const button = form.querySelector('button[type="submit"]'); button.disabled = true; message.textContent = 'OTP சரிபார்க்கப்படுகிறது…';
  try {
    const result = await window.JeeviFirebase.verifyOtp(code, { name: document.getElementById('customer-name').value, address: document.getElementById('customer-address').value });
    sessionStorage.setItem('jeevi_auth_role', result.role);
    sessionStorage.setItem('jeevi_auth_uid', result.user.uid);
    if (result.role === 'admin') location.href = 'admin.html'; else location.href = 'index.html';
  } catch (e) { message.textContent = e.message || 'OTP verify ஆகவில்லை. மீண்டும் முயற்சி செய்.'; }
  finally { button.disabled = false; }
});
