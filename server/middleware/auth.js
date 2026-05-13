const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;          // { userId, groupId, role }
    req.groupId = decoded.groupId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
