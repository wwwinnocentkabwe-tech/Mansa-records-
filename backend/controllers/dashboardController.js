const pool = require('../db');

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const [citizens, land, business] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='Active') AS active FROM citizens`),
      pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='Active') AS active FROM land_records`),
      pool.query(`
        SELECT COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status='Active') AS active,
          COUNT(*) FILTER (WHERE status='Expired') AS expired,
          COUNT(*) FILTER (WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status='Active') AS expiring_soon
        FROM business_licences
      `),
    ]);

    res.json({
      citizens: citizens.rows[0],
      land: land.rows[0],
      business: business.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getDashboardStats };
