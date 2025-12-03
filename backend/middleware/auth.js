const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'devsecretkey';


module.exports = function (req, res, next) {
const auth = req.headers.authorization;
if (!auth) return res.status(401).json({ error: 'No token' });
const token = auth.split(' ')[1];
jwt.verify(token, secret, (err, decoded) => {
if (err) return res.status(401).json({ error: 'Invalid token' });
req.userId = decoded.id;
next();
});
};