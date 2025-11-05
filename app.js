const express = require('express');
const session = require('express-session');
const path = require('path');

// Inisialisasi Aplikasi
const app = express();
const port = 3000;

// ===================================
// 1. DATA MOCK (SIMULASI DATABASE)
// ===================================

const MOCK_PRODUCTS = [
    { id: 1, name: "Lampu Meja Canggih", price: 125000, description: "Lampu meja dengan sensor sentuh dan 3 tingkat kecerahan." },
    { id: 2, name: "Bantal Leher Ergonomis", price: 75000, description: "Bantal busa memori untuk perjalanan yang nyaman." },
    { id: 3, name: "Power Bank 10000mAh Pink", price: 199000, description: "Power bank berkapasitas besar dengan warna Luvyn pink." },
    { id: 4, name: "Kipas Angin Portable Mini", price: 45000, description: "Kipas angin kecil bertenaga baterai, ideal untuk musim panas." },
];

const MOCK_USERS = [
    { id: 101, email: "user@example.com", password: "password", name: "User Luvyn" }
];

// ===================================
// 2. KONFIGURASI EXPRESS & MIDDLEWARE
// ===================================

// Set view engine ke EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware untuk parsing body (untuk POST requests)
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'))); // Menyediakan file statis (CSS)

// Konfigurasi Session
app.use(session({
    secret: 'luvyn-secret-key-12345', // Kunci rahasia untuk enkripsi session ID
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 jam
}));

// Middleware untuk menyediakan data global ke semua view (user, cartCount)
app.use((req, res, next) => {
    // Inject MOCK_PRODUCTS ke request agar bisa diakses di controller
    req.products = MOCK_PRODUCTS;
    req.users = MOCK_USERS;

    // Data Sesi Pengguna
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.user = req.session.user || {};
    
    // Data Keranjang
    const cart = req.session.cart || [];
    res.locals.cart = cart; // Inject seluruh objek cart untuk cart.ejs
    res.locals.cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Hitung total harga item di keranjang
    res.locals.totalItemPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    next();
});

// ===================================
// 3. ROUTE DAN CONTROLLER
// ===================================

const shopController = require('./src/controllers/shopcontroller');

// --- RUTE SHOP/E-COMMERCE ---
app.get('/', shopController.getIndex);
app.get('/cart', shopController.getCart);
app.post('/cart/add/:productId', shopController.postAddToCart);
app.post('/cart/update/:itemId', shopController.postUpdateCart);
app.post('/cart/remove/:itemId', shopController.postRemoveCart);

// --- RUTE AUTENTIKASI ---
app.get('/login', shopController.getLogin);
app.post('/login', shopController.postLogin);
app.post('/logout', shopController.postLogout);
app.get('/register', shopController.getRegister);
app.post('/register', shopController.postRegister); // (Logika registrasi masih mock)

// --- RUTE CHECKOUT (VIEW MOCK) ---
app.get('/checkout', (req, res) => {
    res.render('checkout', { pageTitle: 'Checkout' });
});


// ===================================
// 4. SERVER START
// ===================================
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
    console.log(`Coba akses: http://localhost:${port}`);
});
