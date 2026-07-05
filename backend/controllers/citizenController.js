const pool = require('../db');

// GET /api/citizens
const getCitizens = async (req, res) => {
  const { search, ward, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR nrc_number ILIKE $${params.length} OR phone ILIKE $${params.length})`
    );
  }
  if (ward) { params.push(ward); conditions.push(`ward = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`status = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM citizens ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT c.*, u.full_name AS created_by_name
       FROM citizens c LEFT JOIN users u ON c.created_by = u.id
       ${where} ORDER BY c.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ data: result.rows, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/citizens/:id
const getCitizenById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name AS created_by_name FROM citizens c
       LEFT JOIN users u ON c.created_by = u.id WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Citizen not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/citizens
const createCitizen = async (req, res) => {
  const { nrc_number, first_name, last_name, date_of_birth, gender, phone, email, address, ward, status, notes } = req.body;
  if (!nrc_number || !first_name || !last_name) {
    return res.status(400).json({ message: 'NRC number, first name, and last name are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO citizens (nrc_number, first_name, last_name, date_of_birth, gender, phone, email, address, ward, status, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [nrc_number, first_name, last_name, date_of_birth, gender, phone, email, address, ward, status || 'Active', notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'NRC number already exists.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/citizens/:id
const updateCitizen = async (req, res) => {
  const { nrc_number, first_name, last_name, date_of_birth, gender, phone, email, address, ward, status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE citizens SET nrc_number=$1, first_name=$2, last_name=$3, date_of_birth=$4, gender=$5,
       phone=$6, email=$7, address=$8, ward=$9, status=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [nrc_number, first_name, last_name, date_of_birth, gender, phone, email, address, ward, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Citizen not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/citizens/:id (admin only)
const deleteCitizen = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM citizens WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Citizen not found.' });
    res.json({ message: 'Citizen record deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getCitizens, getCitizenById, createCitizen, updateCitizen, deleteCitizen };
