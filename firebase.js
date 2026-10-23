// Firebase Web SDK (modular). Works when served from localhost or HTTPS hosting.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD6p0wdSVn-jziYoFxteQfNSy_Jfo1SVv0',
  authDomain: 'jeevi-crafty-bangles.firebaseapp.com',
  projectId: 'jeevi-crafty-bangles',
  storageBucket: 'jeevi-crafty-bangles.firebasestorage.app',
  messagingSenderId: '417517976685',
  appId: '1:417517976685:web:d63aa248ccfbebec045364',
  measurementId: 'G-GXM1FYVRPD'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let verifier = null;
let confirmation = null;
let authReadyPromise = new Promise(resolve => onAuthStateChanged(auth, user => resolve(user)));
function waitForAuth() { return authReadyPromise; }

function setupRecaptcha(containerId = 'recaptcha-container') {
  if (verifier) { try { verifier.clear(); } catch (_) {} }
  verifier = new RecaptchaVerifier(auth, containerId, { size: 'normal' });
  return verifier;
}

async function sendOtp(phoneNumber) {
  if (!/^\+91[6-9]\d{9}$/.test(phoneNumber)) throw new Error('இந்திய mobile number +91 உடன் சரியாக உள்ளிடவும்.');
  const recaptcha = setupRecaptcha();
  await recaptcha.render();
  confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
  return true;
}

async function verifyOtp(code, profile = {}) {
  if (!confirmation) throw new Error('முதலில் Send OTP அழுத்தவும்.');
  const result = await confirmation.confirm(code);
  const user = result.user;
  const adminSnap = await getDoc(doc(db, 'adminUsers', user.uid));
  const role = adminSnap.exists() && adminSnap.data().active === true ? 'admin' : 'customer';
  if (role === 'customer') {
    await setDoc(doc(db, 'customers', user.uid), {
      uid: user.uid,
      phone: user.phoneNumber || '',
      name: String(profile.name || '').trim().slice(0, 80),
      address: String(profile.address || '').trim().slice(0, 500),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
  return { user, role };
}

async function saveOrder(order) {
  const user = auth.currentUser || await waitForAuth();
  if (!user) throw new Error('Order செய்ய முதலில் OTP login செய்ய வேண்டும்.');
  const safeOrder = {
    customerUid: user.uid,
    customerPhone: user.phoneNumber || '',
    customerName: String(order.customer?.name || '').slice(0, 80),
    address: String(order.customer?.address || '').slice(0, 500),
    items: (order.items || []).map(i => ({ id: String(i.id), name: String(i.name).slice(0, 100), price: Number(i.price), quantity: Number(i.quantity) })),
    total: Number(order.total),
    paymentMethod: 'DEMO_ONLY',
    paymentStatus: 'NOT_PROCESSED_DEMO',
    status: 'Placed',
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'orders'), safeOrder);
  return ref.id;
}

async function getMyOrders() {
  const user = auth.currentUser || await waitForAuth();
  if (!user) throw new Error('Login required');
  const q = query(collection(db, 'orders'), where('customerUid', '==', user.uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function getProducts() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => String(a.name||'').localeCompare(String(b.name||'')));
}
async function saveProduct(product) {
  const user = auth.currentUser || await waitForAuth();
  if (!user) throw new Error('Admin login required.');
  const id = String(product.id || ('p' + Date.now()));
  const data = {
    name: String(product.name || '').trim().slice(0,80),
    price: Number(product.price),
    category: String(product.category || 'Bangles').slice(0,40),
    image: String(product.image || 'images/image1.png').slice(0,250),
    description: String(product.description || '').trim().slice(0,500),
    updatedAt: serverTimestamp()
  };
  if (!data.name || !Number.isFinite(data.price) || data.price <= 0) throw new Error('Product name and valid price required.');
  await setDoc(doc(db, 'products', id), data, { merge: true });
  return id;
}
async function removeProduct(id) {
  const user = auth.currentUser || await waitForAuth();
  if (!user) throw new Error('Admin login required.');
  await deleteDoc(doc(db, 'products', String(id)));
}
async function importSampleProducts() {
  const samples = [
    {id:'p1',name:'Pink Craft Bangles',price:199,category:'Bangles',image:'images/image1.png',description:'Beautiful handmade bangles with a lovely pink and gold finish.'},
    {id:'p2',name:'Designer Craft Bangles',price:249,category:'Bangles',image:'images/image2.png',description:'A special handmade bangle set, carefully crafted with love.'},
    {id:'p3',name:'Colorful Bangles',price:299,category:'Bangles',image:'images/image3.png',description:'Colorful bangles for festive and everyday looks.'},
    {id:'p4',name:'Traditional Bangles',price:349,category:'Bangles',image:'images/image4.png',description:'Traditional-style handmade bangles for special occasions.'}
  ];
  const existing = await getProducts();
  if (existing.length) throw new Error('Products collection already has items. Import cancelled to avoid overwriting.');
  for (const product of samples) await saveProduct(product);
  return samples.length;
}
async function getAdminOrders() {
  const user = auth.currentUser || await waitForAuth();
  if (!user) throw new Error('Admin login required.');
  const snap = await getDocs(collection(db, 'orders'));
  return snap.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b) => {
    const ta = a.createdAt?.seconds || 0, tb = b.createdAt?.seconds || 0; return tb-ta;
  });
}
window.JeeviFirebase = { auth, db, sendOtp, verifyOtp, saveOrder, getMyOrders, getProducts, saveProduct, removeProduct, importSampleProducts, getAdminOrders, waitForAuth, signOut: () => signOut(auth), onAuthStateChanged };
