const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Fake in-memory data
let users = [];
let tasks = [];

// 🔐 Middleware: authenticate user
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// 📝 Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    const user = { id: users.length + 1, username, password };
    users.push(user);

    res.json({ message: 'User registered', user });
});

// 🔑 Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
});

// 📋 Get tasks (protected)
app.get('/api/tasks', authenticateToken, (req, res) => {
    res.json(tasks);
});

// ➕ Create task (protected)
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title } = req.body;

    const task = {
        id: tasks.length + 1,
        title,
        userId: req.user.id
    };

    tasks.push(task);

    res.json(task);
});


// ✅ STEP 7: Health endpoint (AUTO-DEPLOY TEST)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'API is running',
        environment: process.env.NODE_ENV,
        time: new Date()
    });
});


// 🚀 Start server (ALWAYS LAST)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});