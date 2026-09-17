const express = require('express');
const app = express();
const port = 3333;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Mock user data
const mockUser = {
  id: '1',
  name: 'Usuario Teste',
  email: 'teste@zyntrix.com',
  role: 'user',
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let mockToken = null;

// Routes under /api prefix (matching client expectations)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Senhas nao correspondem' });
  }
  mockToken = `mock-token-${Date.now()}`;
  res.json({ success: true, data: { user: { ...mockUser, name: name || mockUser.name, email: email || mockUser.email }, token: mockToken } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, remember } = req.body;
  mockToken = `mock-token-${Date.now()}`;
  res.json({ success: true, data: { user: { ...mockUser, email: email || mockUser.email }, token: mockToken } });
});

app.post('/api/auth/logout', (req, res) => {
  mockToken = null;
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (mockToken) {
    res.json({ success: true, data: { user: mockUser } });
  } else {
    res.status(401).json({ success: false, message: 'Nao autenticado' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Email de recuperacao enviado' });
});

app.post('/api/auth/reset-password', (req, res) => {
  res.json({ success: true, message: 'Senha redefinida com sucesso' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Mock API running at http://localhost:${port}`);
});
