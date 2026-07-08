const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_active = TRUE',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log('DEBUG - User found:', user.username, '| Password match:', passwordMatch, '| JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
console.log('DEBUG - User found:', user.username, '| Password match:', passwordMatch, '| JWT_SECRET exists:', !!process.env.JWT_SECRET);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/auth/users (admin only)
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/auth/users (admin only)
const createUser = async (req, res) => {
  const { full_name, username, email, password, role } = req.body;
  if (!full_name || !username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, full_name, username, email, role`,
      [full_name, username, email, hash, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Username or email already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { login, getMe, getUsers, createUser };
