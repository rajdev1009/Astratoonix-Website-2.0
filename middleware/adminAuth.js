// middleware/adminAuth.js
// Protects all write routes — requires x-admin-token header

const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Unauthorized — Admin access only', auth: false });
  }
  next();
};

module.exports = adminAuth;
