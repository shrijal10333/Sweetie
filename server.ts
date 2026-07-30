
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';

dotenv.config();

// ── User store (file-backed) ───────────────────────────────────────────────
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string | null;
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function loadUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(path.dirname(USERS_FILE))) fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  if (!fs.existsSync(path.dirname(USERS_FILE))) fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// ── Products store (file-backed) ───────────────────────────────────────────
const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');

function loadProducts(): any[] {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveProducts(products: any[]) {
  if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true });
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', brand: 'Cherry Lush Store', timestamp: new Date().toISOString() });
  });

  // ── Live visitor tracking (in-memory heartbeat) ───────────────────────────
  const visitorSessions = new Map<string, number>(); // sid -> lastSeen ms
  const VISITOR_TTL = 2 * 60 * 1000; // 2 minutes

  function getLiveCount() {
    const now = Date.now();
    for (const [sid, ts] of visitorSessions) { if (now - ts > VISITOR_TTL) visitorSessions.delete(sid); }
    return visitorSessions.size;
  }

  app.post('/api/analytics/ping', (req, res) => {
    const { sid } = req.body as { sid?: string };
    if (sid) visitorSessions.set(sid, Date.now());
    res.json({ ok: true, live: getLiveCount() });
  });

  // ── Admin SSE stream ────────────────────────────────────────────────────────
  const adminClients = new Set<express.Response>();

  function broadcastAdmin(data: object) {
    const msg = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of adminClients) { try { client.write(msg); } catch { adminClients.delete(client); } }
  }

  // Push live data every 5 seconds
  setInterval(() => {
    const users = loadUsers();
    broadcastAdmin({
      type: 'tick',
      liveVisitors: getLiveCount(),
      totalUsers: users.length,
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt })),
      ts: Date.now(),
    });
  }, 5000);

  app.get('/api/admin/stream', (req, res) => {
    // Accept token via query param (EventSource can't set headers)
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '') || '';
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || !token) { res.status(401).end(); return; }
    try { const p = jwt.verify(token, sessionSecret) as any; if (!p.isAdmin) { res.status(403).end(); return; } }
    catch { res.status(401).end(); return; }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Send initial snapshot immediately
    const users = loadUsers();
    res.write(`data: ${JSON.stringify({ type: 'init', liveVisitors: getLiveCount(), totalUsers: users.length, users: users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt })), ts: Date.now() })}\n\n`);

    adminClients.add(res);
    req.on('close', () => adminClients.delete(res));
  });

  // ── Admin Login ────────────────────────────────────────────────────────────
  // Credentials are read from server-side environment variables only.
  // They are never exposed in client code.
  app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };

    const adminEmail    = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.SESSION_SECRET;

    if (!adminEmail || !adminPassword || !sessionSecret) {
      return res.status(500).json({
        error: 'Admin is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in Replit Secrets.',
      });
    }

    if (
      typeof email === 'string' &&
      typeof password === 'string' &&
      email.trim() === adminEmail &&
      password.trim() === adminPassword
    ) {
      const token = jwt.sign(
        { isAdmin: true, email: adminEmail },
        sessionSecret,
        { expiresIn: '24h' },
      );
      return res.json({ token });
    }

    return res.status(401).json({ error: 'Invalid admin credentials.' });
  });

  // ── Product store & API ───────────────────────────────────────────────────
  // GET all products
  app.get('/api/products', (req, res) => {
    return res.json(loadProducts());
  });

  // POST save product list or single product
  app.post('/api/products', (req, res) => {
    const body = req.body;
    if (Array.isArray(body)) {
      saveProducts(body);
      broadcastAdmin({ type: 'products_synced', count: body.length });
      return res.json({ ok: true, products: body });
    } else if (body && body.id) {
      const products = loadProducts();
      const existingIdx = products.findIndex((p: any) => p.id === body.id);
      if (existingIdx > -1) {
        products[existingIdx] = body;
      } else {
        products.unshift(body);
      }
      saveProducts(products);
      broadcastAdmin({ type: 'product_saved', product: body });
      return res.json({ ok: true, product: body });
    }
    return res.status(400).json({ error: 'Invalid product data' });
  });

  // DELETE product by ID
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const products = loadProducts();
    const updated = products.filter((p: any) => p.id !== id);
    saveProducts(updated);
    broadcastAdmin({ type: 'product_deleted', productId: id, count: updated.length });
    return res.json({ ok: true, deletedId: id, remaining: updated.length });
  });

  // ── Order store (file-backed) ─────────────────────────────────────────────
  const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
  function loadOrders(): any[] {
    try {
      if (!fs.existsSync(ORDERS_FILE)) return [];
      return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    } catch { return []; }
  }
  function saveOrders(orders: any[]) {
    if (!fs.existsSync(path.dirname(ORDERS_FILE))) fs.mkdirSync(path.dirname(ORDERS_FILE), { recursive: true });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  }

  // POST a new order from checkout
  app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order || !order.id) return res.status(400).json({ error: 'Invalid order' });
    const orders = loadOrders();
    // Avoid duplicates
    if (!orders.find((o: any) => o.id === order.id)) {
      orders.unshift(order);
      saveOrders(orders);
      // Broadcast to admin SSE clients
      broadcastAdmin({ type: 'new_order', order, liveVisitors: getLiveCount(), totalUsers: loadUsers().length });
    }
    return res.json({ ok: true });
  });

  // GET public orders count / happy customers count
  app.get('/api/orders/public-count', (req, res) => {
    const orders = loadOrders();
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum: number, o: any) => sum + (o.items || []).reduce((iSum: number, item: any) => iSum + (item.quantity || 1), 0), 0);
    return res.json({ totalOrders, totalItems, happyCustomers: totalOrders });
  });

  // GET single order by ID — public, no auth (order ID acts as the access key)
  app.get('/api/orders/:id', (req, res) => {
    const orders = loadOrders();
    const order = orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(order);
  });

  // GET all orders (admin only)
  app.get('/api/orders', (req, res) => {
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '') || '';
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || !token) return res.status(401).json({ error: 'Unauthorized' });
    try { const p = jwt.verify(token, sessionSecret) as any; if (!p.isAdmin) return res.status(403).json({ error: 'Forbidden' }); }
    catch { return res.status(401).json({ error: 'Invalid token' }); }
    return res.json(loadOrders());
  });

  // PATCH order status (admin only)
  app.patch('/api/orders/:id', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || !token) return res.status(401).json({ error: 'Unauthorized' });
    try { const p = jwt.verify(token, sessionSecret) as any; if (!p.isAdmin) return res.status(403).json({ error: 'Forbidden' }); }
    catch { return res.status(401).json({ error: 'Invalid token' }); }
    const orders = loadOrders();
    const idx = orders.findIndex((o: any) => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const { orderStatus, adminDeliveryDate } = req.body;
    if (orderStatus) orders[idx].orderStatus = orderStatus;
    if (adminDeliveryDate !== undefined) orders[idx].adminDeliveryDate = adminDeliveryDate;
    saveOrders(orders);
    broadcastAdmin({ type: 'order_updated', order: orders[idx] });
    return res.json({ ok: true, order: orders[idx] });
  });

  // ── Instagram store (file-backed) ───────────────────────────────────────
  const INSTA_FILE = path.join(process.cwd(), 'data', 'insta_posts.json');
  function loadInstaPosts(): any[] {
    try {
      if (!fs.existsSync(INSTA_FILE)) return [];
      const data = fs.readFileSync(INSTA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch { return []; }
  }
  function saveInstaPosts(posts: any[]) {
    if (!fs.existsSync(path.dirname(INSTA_FILE))) fs.mkdirSync(path.dirname(INSTA_FILE), { recursive: true });
    fs.writeFileSync(INSTA_FILE, JSON.stringify(posts, null, 2));
  }

  app.get('/api/instagram', (req, res) => {
    res.json(loadInstaPosts());
  });

  app.post('/api/instagram', (req, res) => {
    const posts = loadInstaPosts();
    const newPost = { ...req.body, id: req.body.id || `insta-${Date.now()}` };
    const updated = [newPost, ...posts.filter((p: any) => p.id !== newPost.id)];
    saveInstaPosts(updated);
    broadcastAdmin({ type: 'insta_updated', posts: updated });
    res.json({ ok: true, post: newPost, posts: updated });
  });

  app.delete('/api/instagram/:id', (req, res) => {
    const posts = loadInstaPosts();
    const updated = posts.filter((p: any) => p.id !== req.params.id);
    saveInstaPosts(updated);
    broadcastAdmin({ type: 'insta_updated', posts: updated });
    res.json({ ok: true, posts: updated });
  });

  // ── Customer Register ─────────────────────────────────────────────────────
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const users = loadUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists. Please login.' });

    const salt = generateSalt();
    const passwordHash = hashPassword(password.trim(), salt);
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    users.push(newUser);
    saveUsers(users);

    return res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  });

  // ── Customer Login ─────────────────────────────────────────────────────────
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return res.status(401).json({ error: 'No account found with this email. Please register first.' });

    const hash = hashPassword(password.trim(), user.salt);
    if (hash !== user.passwordHash) return res.status(401).json({ error: 'Incorrect password.' });

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret';
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, sessionSecret, { expiresIn: '7d' });
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  });

  // ── Admin: Get All Users ───────────────────────────────────────────────────
  app.get('/api/auth/users', (req, res) => {
    const authHeader = req.headers.authorization;
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret || !authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const payload = jwt.verify(authHeader.slice(7), sessionSecret) as any;
      if (!payload.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    } catch { return res.status(401).json({ error: 'Invalid token' }); }

    const users = loadUsers();
    return res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt })));
  });

  // ── Gemini AI Stylist ──────────────────────────────────────────────────────
  app.post('/api/gemini/stylist', async (req, res) => {
    try {
      const { userPrompt, budget, occasion, targetPerson, currentProducts } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({
          recommendation: `✨ **Cherry Stylist Recommends:**\n\nFor a ${occasion || 'special occasion'} for ${targetPerson || 'a loved one'}, our top picks from Cherry Lush Store are:\n\n1. **Princess Rose Gold Bow Pearl Earrings** (₹699) - A timeless coquette touch!\n2. **Cherry Rose Blossom Lip Tint** (₹599) - For that signature rosy shine.\n3. **Cherry Luxury Pamper Gift Hamper Box** (₹2,499) - The ultimate unboxing joy! 💖`,
          suggestedCategory: 'Jewellery',
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const catalogSummary = (currentProducts || []).slice(0, 10).map((p: any) =>
        `- ${p.name} (Category: ${p.category}, Price: ₹${p.price}, Rating: ${p.rating}★)`
      ).join('\n');

      const promptText = `
You are "Cherry Stylist", the friendly, cute, fashionable AI personal shopper for "Cherry Lush Store", an aesthetic Indian women's fashion & lifestyle boutique.
Speak in a warm, enthusiastic, cute, and elegant tone with soft emojis (✨, 🎀, 💖, 🌸, 🍒).

User Request: "${userPrompt || 'Suggest a cute gift or outfit pairing'}"
Budget: ${budget ? '₹' + budget : 'Flexible'}
Occasion: ${occasion || 'General Fashion / Gift'}
Target Person: ${targetPerson || 'Self or Bestie'}

Our Store Catalog Highlights:
${catalogSummary}

Please provide a personalized 2-3 paragraph styling advice & product recommendation list specifically referencing products from Cherry Lush Store catalog above with prices in INR (₹). End with a sweet encouraging remark!
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
      });

      const text = response.text || '✨ Cherry Stylist recommends exploring our Best Sellers for an instant glow!';
      return res.json({ recommendation: text });
    } catch (error: any) {
      console.error('Error in Gemini Stylist endpoint:', error);
      res.status(500).json({
        error: 'Stylist busy right now',
        recommendation: '✨ **Cherry Stylist Recommends:** Check out our **Princess Rose Gold Bow Earrings** (₹699) and **Pastel Blush Quilted Bag** (₹1,499) for an effortless coquette look! 💖',
      });
    }
  });

  // ── Vite / static serving ──────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cherry Lush Store server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
